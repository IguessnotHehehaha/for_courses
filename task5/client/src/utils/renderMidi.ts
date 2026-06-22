import * as Tone from 'tone'
import { Midi } from '@tonejs/midi'

export async function renderMidiToBlob(midiUrl: string): Promise<Blob> {
    const response = await fetch(midiUrl)
    const arrayBuffer = await response.arrayBuffer()
    const midi = new Midi(arrayBuffer)
    const duration = midi.duration + 2

    const buffer = await Tone.Offline(({ transport }) => {
        const bpm = midi.header.tempos[0]?.bpm ?? 120
        transport.bpm.value = bpm

        const vol = new Tone.Volume(0).toDestination()
        const reverb = new Tone.Reverb({ decay: 1.8, wet: 0.18, preDelay: 0.01 })
        reverb.connect(vol)
        const comp = new Tone.Compressor({ threshold: -20, ratio: 4, attack: 0.003, release: 0.25 })
        comp.connect(reverb)

        midi.tracks.forEach((track, i) => {
            if (track.notes.length === 0) return
            if (i > 2) return

            let synth: Tone.PolySynth

            if (i === 0) {
                synth = new Tone.PolySynth(Tone.AMSynth, {
                    harmonicity: 2,
                    oscillator: { type: 'sine' },
                    envelope: { attack: 0.02, decay: 0.2, sustain: 0.7, release: 0.8 },
                    modulation: { type: 'square' },
                    modulationEnvelope: { attack: 0.5, decay: 0.1, sustain: 1, release: 0.5 },
                    volume: -4,
                })
            } else if (i === 1) {
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

            synth.connect(comp)

            const part = new Tone.Part((time, value: { note: string, duration: number, velocity: number }) => {
                synth.triggerAttackRelease(value.note, value.duration, time, value.velocity)
            }, track.notes.map(n => ({
                time: n.time,
                note: n.name,
                duration: n.duration,
                velocity: n.velocity,
            })))

            part.start(0)
        })

        transport.start()
    }, duration)

    const wavBlob = audioBufferToWav(buffer.get()!)
    return wavBlob
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    const byteRate = sampleRate * blockAlign
    const dataSize = buffer.length * blockAlign
    const arrayBuffer = new ArrayBuffer(44 + dataSize)
    const view = new DataView(arrayBuffer)

    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + dataSize, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, byteRate, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(view, 36, 'data')
    view.setUint32(40, dataSize, true)

    let offset = 44
    for (let i = 0; i < buffer.length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]))
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
            offset += 2
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i))
    }
}