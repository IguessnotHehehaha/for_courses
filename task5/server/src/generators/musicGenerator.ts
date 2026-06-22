import seedrandom from 'seedrandom'
const MidiWriter = require('midi-writer-js')

const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
}

type ScaleType = keyof typeof SCALES

function midiNoteToName(midi: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const octave = Math.floor(midi / 12) - 1
    return `${notes[midi % 12]}${octave}`
}

function clampSafe(note: number): number {
    return Math.max(48, Math.min(84, note))
}

function getScaleNotes(
    root: number,
    scale: ScaleType,
    octave: number
): number[] {
    return SCALES[scale].map(
        interval => clampSafe(root + interval + octave * 12)
    )
}

function getChord(
    root: number,
    scale: ScaleType,
    degree: number,
    octave: number
): number[] {
    const scaleNotes = getScaleNotes(root, scale, octave)
    const extended = [
        ...scaleNotes,
        ...getScaleNotes(root, scale, octave + 1),
    ]

    return [
        extended[degree % 7],
        extended[(degree + 2) % 7],
        extended[(degree + 4) % 7],
    ]
}

function generateMotif(
    rng: seedrandom.PRNG,
    scaleNotes: number[]
): number[] {
    const motif: number[] = []

    let current =
        scaleNotes[Math.floor(rng() * scaleNotes.length)]

    motif.push(current)

    for (let i = 1; i < 8; i++) {
        const nearby = scaleNotes.filter(
            n => Math.abs(n - current) <= 5
        )

        current =
            nearby[Math.floor(rng() * nearby.length)]

        motif.push(current)
    }

    return motif
}

export function generateMidi(
    seed: string,
    title: string
): Buffer {

    const rng = seedrandom(`music_${seed}_${title}`)
    const tempo = 95 + Math.floor(rng() * 30)
    const scale: ScaleType = rng() > 0.5 ? 'major' : 'minor'

    const possibleRoots = [
        48,
        50,
        52,
        53,
        55,
        57,
        59,
    ]

    const root =
        possibleRoots[
            Math.floor(rng() * possibleRoots.length)
            ]

    const octave = 0

    const scaleNotes = [
        ...getScaleNotes(root, scale, octave + 1),
        ...getScaleNotes(root, scale, octave + 2),
    ]

    const progression = [0, 4, 5, 3]

    const motifs = Array.from(
        { length: 5 },
        () => generateMotif(rng, scaleNotes)
    )

    const arrangement = [
        0, 0, 1, 0,
        2, 2, 1, 0,
        3, 3, 4, 0,
        2, 1, 0, 0,
    ]

    const melodyTrack = new MidiWriter.Track()
    const chordTrack = new MidiWriter.Track()
    const bassTrack = new MidiWriter.Track()

    melodyTrack.setTempo(tempo)
    chordTrack.setTempo(tempo)
    bassTrack.setTempo(tempo)

    melodyTrack.addEvent(
        new MidiWriter.ProgramChangeEvent({
            instrument: 1,
        })
    )

    chordTrack.addEvent(
        new MidiWriter.ProgramChangeEvent({
            instrument: 5,
        })
    )

    bassTrack.addEvent(
        new MidiWriter.ProgramChangeEvent({
            instrument: 33,
        })
    )

    arrangement.forEach((motifIndex, bar) => {

        const motif = motifs[motifIndex]
        const chordDegree = progression[bar % progression.length]

        const chord = getChord(
            root,
            scale,
            chordDegree,
            octave + 1
        )

        const bassNote = chord[0]

        motif.forEach((originalNote, noteIndex) => {
            let note = originalNote
            if (rng() < 0.15) {
                const shift =
                    rng() < 0.5 ? -2 : 2

                note = clampSafe(note + shift)
            }
            const velocity =
                noteIndex === 7
                    ? 85
                    : 65

            melodyTrack.addEvent(
                new MidiWriter.NoteEvent({
                    pitch: [midiNoteToName(note)],
                    duration: '8',
                    velocity,
                })
            )
        })

        chordTrack.addEvent(
            new MidiWriter.NoteEvent({
                pitch: chord.map(midiNoteToName),
                duration: '1',
                velocity: 45,
            })
        )

        for (let i = 0; i < 4; i++) {
            bassTrack.addEvent(
                new MidiWriter.NoteEvent({
                    pitch: [
                        midiNoteToName(
                            clampSafe(bassNote - 12)
                        ),
                    ],
                    duration: '4',
                    velocity: 60,
                })
            )
        }
    })

    const writer = new MidiWriter.Writer([
        melodyTrack,
        chordTrack,
        bassTrack,
    ])

    const base64 = writer.base64()

    return Buffer.from(base64, 'base64')
}