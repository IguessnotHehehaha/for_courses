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

    const synthsRef = useRef<Tone.PolySynth[]>([])
    const drumSynthsRef = useRef<Tone.ToneAudioNode[]>([])
    const nodesRef = useRef<Tone.ToneAudioNode[]>([])

    const partsRef = useRef<Tone.Part[]>([])
    const rafRef = useRef<number>(0)
    const midiBufferRef = useRef<ArrayBuffer | null>(null)
    const durationRef = useRef(0)

    const volumeNodeRef = useRef<Tone.Volume | null>(null)
    const chainRef = useRef<{
        eq?: Tone.EQ3
        comp?: Tone.Compressor
        reverb?: Tone.Reverb
    }>({})

    const cleanup = useCallback(() => {
        cancelAnimationFrame(rafRef.current)

        partsRef.current.forEach(p => p.dispose())
        synthsRef.current.forEach(s => s.dispose())
        drumSynthsRef.current.forEach(s => {
            try { s.dispose() } catch {}
        })

        partsRef.current = []
        synthsRef.current = []
        drumSynthsRef.current = []

        Object.values(chainRef.current).forEach(n => n?.dispose())
        chainRef.current = {}

        volumeNodeRef.current?.dispose()
        volumeNodeRef.current = null

        nodesRef.current.forEach(n => {
            try { n.dispose() } catch {}
        })
        nodesRef.current = []

        Tone.getTransport().stop()
        Tone.getTransport().cancel()
    }, [])

    const stop = useCallback(() => {
        cleanup()
        setState(s => ({
            ...s,
            isPlaying: false,
            progress: 0,
            currentTime: 0,
        }))
    }, [cleanup])

    const seekTo = useCallback((progress: number) => {
        if (!durationRef.current) return

        const time = progress * durationRef.current
        Tone.getTransport().seconds = time

        setState(s => ({
            ...s,
            progress,
            currentTime: time,
        }))
    }, [])

    const setVolume = useCallback((vol: number) => {
        setState(s => ({ ...s, volume: vol }))

        if (volumeNodeRef.current) {
            volumeNodeRef.current.volume.value =
                vol <= 0 ? -Infinity : 20 * Math.log10(vol)
        }
    }, [])

    const play = useCallback(async () => {
        if (!midiUrl) return

        if (state.isPlaying) {
            stop()
            return
        }

        setState(s => ({ ...s, isLoading: true }))

        try {
            await Tone.start()

            if (!midiBufferRef.current) {
                const res = await fetch(midiUrl)
                midiBufferRef.current = await res.arrayBuffer()
            }

            const midi = new Midi(midiBufferRef.current.slice(0))
            durationRef.current = midi.duration

            Tone.getTransport().bpm.value =
                midi.header.tempos[0]?.bpm ?? 120

            const vol = new Tone.Volume(
                state.volume <= 0 ? -Infinity : 20 * Math.log10(state.volume)
            ).toDestination()

            volumeNodeRef.current = vol

            const eq = new Tone.EQ3({
                low: -2,
                mid: 2,
                high: 3,
            }).connect(vol)

            const comp = new Tone.Compressor({
                threshold: -20,
                ratio: 3,
                attack: 0.003,
                release: 0.25,
            }).connect(eq)

            const reverb = new Tone.Reverb({
                decay: 2.2,
                wet: 0.18,
            })

            await reverb.ready
            reverb.connect(comp)

            chainRef.current = { eq, comp, reverb }
            nodesRef.current.push(eq, comp, reverb)

            const drumNotes: any[] = []

            midi.tracks.forEach(track => {
                // 🎯 channel 9 = drums
                if (track.channel === 9) {
                    track.notes.forEach(n => {
                        drumNotes.push({
                            time: n.time,
                            note: n.name,
                            duration: 0.15,
                            velocity: Math.max(n.velocity, 0.2),
                        })
                    })
                    return
                }

                if (!track.notes.length) return

                const synth = new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: 'triangle' },
                    envelope: {
                        attack: 0.01,
                        decay: 0.1,
                        sustain: 0.7,
                        release: 1.2,
                    },
                    volume: -6,
                }).connect(reverb)

                synthsRef.current.push(synth)

                const notes = track.notes.map(n => ({
                    time: n.time,
                    note: n.name,
                    duration: n.duration,
                    velocity: Math.max(n.velocity, 0.05),
                }))

                const part = new Tone.Part((time, value: any) => {
                    synth.triggerAttackRelease(
                        value.note,
                        value.duration,
                        time,
                        value.velocity
                    )
                }, notes)

                part.start(0)
                partsRef.current.push(part)
            })

            if (drumNotes.length > 0) {
                const drumSynth = new Tone.MembraneSynth({
                    pitchDecay: 0.05,
                    octaves: 8,
                    envelope: {
                        attack: 0.001,
                        decay: 0.2,
                        sustain: 0,
                        release: 0.1,
                    },
                }).connect(reverb)

                drumSynthsRef.current.push(drumSynth)

                const drumPart = new Tone.Part((time, value: any) => {
                    drumSynth.triggerAttackRelease(
                        value.note,
                        value.duration,
                        time,
                        value.velocity
                    )
                }, drumNotes)

                drumPart.start(0)
                partsRef.current.push(drumPart)
            }

            Tone.getTransport().start()

            setState(s => ({
                ...s,
                isPlaying: true,
                isLoading: false,
                duration: midi.duration,
            }))

            const tick = () => {
                const current = Tone.getTransport().seconds
                const progress = Math.min(current / midi.duration, 1)

                setState(s => ({
                    ...s,
                    currentTime: current,
                    progress,
                }))

                if (current < midi.duration) {
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
        return () => cleanup()
    }, [cleanup])

    return {
        play,
        stop,
        seekTo,
        setVolume,
        state,
    }
}