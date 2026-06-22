import { useEffect, useRef, useState, useCallback } from 'react'
import * as Tone from 'tone'
import { Midi } from '@tonejs/midi'

export interface PlayerState {
    isPlaying: boolean
    isLoading: boolean
    progress: number
    currentTime: number
    duration: number
    volume: number
}

export function useMidiPlayer(midiUrl: string | null) {
    const [state, setState] = useState<PlayerState>({
        isPlaying: false,
        isLoading: false,
        progress: 0,
        currentTime: 0,
        duration: 0,
        volume: 0.8,
    })

    const synthsRef = useRef<Tone.ToneAudioNode[]>([])
    const partsRef = useRef<Tone.Part[]>([])
    const durationRef = useRef(0)
    const volumeNodeRef = useRef<Tone.Volume | null>(null)
    const rafRef = useRef<number>(0)
    const midiBufferRef = useRef<ArrayBuffer | null>(null)

    const cleanup = useCallback(() => {
        cancelAnimationFrame(rafRef.current)
        partsRef.current.forEach(p => { try { p.dispose() } catch {} })
        synthsRef.current.forEach(s => { try { s.dispose() } catch {} })
        if (volumeNodeRef.current) { try { volumeNodeRef.current.dispose() } catch {} }
        partsRef.current = []
        synthsRef.current = []
        volumeNodeRef.current = null
        Tone.getTransport().stop()
        Tone.getTransport().cancel()
    }, [])

    const stop = useCallback(() => {
        cleanup()
        setState(s => ({ ...s, isPlaying: false, progress: 0, currentTime: 0 }))
    }, [cleanup])

    const seekTo = useCallback((progress: number) => {
        if (!durationRef.current) return
        const time = progress * durationRef.current
        Tone.getTransport().seconds = time
        setState(s => ({ ...s, progress, currentTime: time }))
    }, [])

    const setVolume = useCallback((vol: number) => {
        setState(s => ({ ...s, volume: vol }))
        if (volumeNodeRef.current) {
            volumeNodeRef.current.volume.value = vol === 0 ? -Infinity : 20 * Math.log10(vol)
        }
    }, [])

    const play = useCallback(async () => {
        if (!midiUrl) return
        if (state.isPlaying) { stop(); return }

        setState(s => ({ ...s, isLoading: true }))

        try {
            await Tone.start()

            if (!midiBufferRef.current) {
                const response = await fetch(midiUrl)
                midiBufferRef.current = await response.arrayBuffer()
            }

            const midi = new Midi(midiBufferRef.current.slice(0))
            const totalDuration = midi.duration
            durationRef.current = totalDuration

            Tone.getTransport().bpm.value = midi.header.tempos[0]?.bpm ?? 120

            const vol = new Tone.Volume(
                state.volume === 0 ? -Infinity : 20 * Math.log10(state.volume)
            ).toDestination()
            volumeNodeRef.current = vol

            const reverb = new Tone.Reverb({ decay: 1.8, wet: 0.18, preDelay: 0.01 })
            await reverb.ready
            reverb.connect(vol)
            synthsRef.current.push(reverb)

            const comp = new Tone.Compressor({ threshold: -20, ratio: 4, attack: 0.003, release: 0.25 })
            comp.connect(reverb)
            synthsRef.current.push(comp)

            let instrumentIndex = 0

            midi.tracks.forEach((track) => {
                if (track.notes.length === 0) return

                const isDrumTrack = track.channel === 9
                if (isDrumTrack) return

                let synth: Tone.PolySynth

                if (instrumentIndex === 0) {
                    synth = new Tone.PolySynth(Tone.AMSynth, {
                        harmonicity: 2,
                        oscillator: { type: 'sine' },
                        envelope: { attack: 0.02, decay: 0.2, sustain: 0.7, release: 0.8 },
                        modulation: { type: 'square' },
                        modulationEnvelope: { attack: 0.5, decay: 0.1, sustain: 1, release: 0.5 },
                        volume: -4,
                    })
                } else if (instrumentIndex === 1) {
                    synth = new Tone.PolySynth(Tone.FMSynth, {
                        harmonicity: 3,
                        modulationIndex: 10,
                        oscillator: { type: 'sine' },
                        envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 1.5 },
                        modulation: { type: 'sine' },
                        modulationEnvelope: { attack: 0.5, decay: 0.4, sustain: 0.3, release: 1 },
                        volume: -14,
                    })
                } else {
                    synth = new Tone.PolySynth(Tone.Synth, {
                        oscillator: { type: 'sawtooth' },
                        envelope: { attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.4 },
                        volume: -6,
                    })
                }

                instrumentIndex++
                synth.connect(comp)
                synthsRef.current.push(synth)

                const part = new Tone.Part(
                    (time, value: { note: string, duration: number, velocity: number }) => {
                        synth.triggerAttackRelease(value.note, value.duration, time, value.velocity)
                    },
                    track.notes.map(n => ({
                        time: n.time,
                        note: n.name,
                        duration: n.duration,
                        velocity: n.velocity,
                    }))
                )

                part.start(0)
                partsRef.current.push(part)
            })

            Tone.getTransport().start()
            setState(s => ({ ...s, isPlaying: true, isLoading: false, duration: totalDuration }))

            const tick = () => {
                const current = Tone.getTransport().seconds
                const progress = Math.min(current / totalDuration, 1)
                setState(s => ({ ...s, currentTime: current, progress }))
                if (current < totalDuration) {
                    rafRef.current = requestAnimationFrame(tick)
                } else {
                    stop()
                }
            }
            rafRef.current = requestAnimationFrame(tick)

        } catch (err) {
            console.error('MIDI playback error:', err)
            setState(s => ({ ...s, isLoading: false }))
        }
    }, [midiUrl, state.isPlaying, state.volume, stop])

    useEffect(() => {
        midiBufferRef.current = null
    }, [midiUrl])

    useEffect(() => {
        return () => { cleanup() }
    }, [cleanup])

    return { play, stop, seekTo, setVolume, state }
}