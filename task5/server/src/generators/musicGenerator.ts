import seedrandom from 'seedrandom'
const MidiWriter = require('midi-writer-js')

const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
}

const CHORD_PROGRESSIONS = [
    [0, 5, 3, 4],
    [0, 3, 4, 4],
    [0, 4, 5, 3],
    [5, 3, 0, 4],
    [0, 0, 4, 5],
    [0, 2, 3, 4],
]

const ROOT_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

type ScaleType = keyof typeof SCALES

function getScaleNotes(root: number, scale: ScaleType, octave: number): number[] {
    return SCALES[scale].map(interval => root + interval + octave * 12)
}

function getChordNotes(root: number, scale: ScaleType, degree: number, octave: number): number[] {
    const scaleNotes = getScaleNotes(root, scale, octave)
    const extended = [...scaleNotes, ...getScaleNotes(root, scale, octave + 1)]

    return [
        extended[degree % 7],
        extended[(degree + 2) % 7],
        extended[(degree + 4) % 7],
    ]
}

function midiNoteToName(midi: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const octave = Math.floor(midi / 12) - 1
    const note = notes[midi % 12]
    return `${note}${octave}`
}

function clampSafe(note: number) {
    return Math.max(48, Math.min(84, note))
}

export function generateMidi(seed: string, title: string): Buffer {
    const rng = seedrandom(`music_${seed}_${title}`)

    const tempo = 90 + Math.floor(rng() * 40) // stable tempo range
    const scaleKeys = Object.keys(SCALES) as ScaleType[]
    const scale = scaleKeys[Math.floor(rng() * scaleKeys.length)]

    const rootIndex = Math.floor(rng() * ROOT_NOTES.length)
    const root = rootIndex + 60 - 12

    const octave = 4
    const progression = CHORD_PROGRESSIONS[Math.floor(rng() * CHORD_PROGRESSIONS.length)]
    const bars = 8 + Math.floor(rng() * 4)


    const melodyTrack = new MidiWriter.Track()
    melodyTrack.setTempo(tempo)
    melodyTrack.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }))

    const scaleNotes = [
        ...getScaleNotes(root, scale, octave),
        ...getScaleNotes(root, scale, octave + 1),
    ].map(clampSafe)

    const durations = ['4', '8', '8'] as const

    for (let bar = 0; bar < bars; bar++) {
        const chordDegree = progression[bar % progression.length]

        const notesInBar = 2 + Math.floor(rng() * 2)

        for (let i = 0; i < notesInBar; i++) {
            const useChord = rng() > 0.3

            let pitch: number

            if (useChord) {
                const chord = getChordNotes(root, scale, chordDegree, octave).map(clampSafe)
                pitch = chord[Math.floor(rng() * chord.length)]
            } else {
                pitch = scaleNotes[Math.floor(rng() * scaleNotes.length)]
            }

            melodyTrack.addEvent(new MidiWriter.NoteEvent({
                pitch: [midiNoteToName(pitch)],
                duration: durations[Math.floor(rng() * durations.length)],
                velocity: 60 + Math.floor(rng() * 25), // controlled velocity
            }))
        }
    }

    const chordTrack = new MidiWriter.Track()
    chordTrack.setTempo(tempo)
    chordTrack.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 5 }))

    for (let bar = 0; bar < bars; bar++) {
        const chordDegree = progression[bar % progression.length]

        const chord = getChordNotes(root, scale, chordDegree, octave - 1)
            .map(clampSafe)

        const velocity = 45 + Math.floor(rng() * 15)

        chordTrack.addEvent(new MidiWriter.NoteEvent({
            pitch: chord.map(midiNoteToName),
            duration: '2',
            velocity,
        }))
    }


    const bassTrack = new MidiWriter.Track()
    bassTrack.setTempo(tempo)
    bassTrack.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 33 }))

    for (let bar = 0; bar < bars; bar++) {
        const chordDegree = progression[bar % progression.length]

        const bassRoot = getChordNotes(root, scale, chordDegree, octave - 2)[0]

        const safeBass = clampSafe(bassRoot + 12)

        bassTrack.addEvent(new MidiWriter.NoteEvent({
            pitch: [midiNoteToName(safeBass)],
            duration: '2',
            velocity: 65,
        }))
    }

    const writer = new MidiWriter.Writer([
        melodyTrack,
        chordTrack,
        bassTrack
    ])

    const base64 = writer.base64()
    return Buffer.from(base64, 'base64')
}