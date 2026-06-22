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
const OCTAVES = [4]

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

export function generateMidi(seed: string, title: string): Buffer {
    const rng = seedrandom(`music_${seed}_${title}`)

    const tempo = 70 + Math.floor(rng() * 100)  // 70–170 BPM
    const scaleKeys = Object.keys(SCALES) as ScaleType[]
    const scale = scaleKeys[Math.floor(rng() * scaleKeys.length)]
    const rootIndex = Math.floor(rng() * ROOT_NOTES.length)
    const root = rootIndex + 60 - 12  // MIDI note number for root
    const octave = OCTAVES[Math.floor(rng() * OCTAVES.length)]
    const progression = CHORD_PROGRESSIONS[Math.floor(rng() * CHORD_PROGRESSIONS.length)]
    const bars = 8 + Math.floor(rng() * 8)  // 8–16 bars

    const melodyTrack = new MidiWriter.Track()
    melodyTrack.setTempo(tempo)
    melodyTrack.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 })) // Piano

    const scaleNotes = [
        ...getScaleNotes(root, scale, octave),
        ...getScaleNotes(root, scale, octave + 1),
    ]

    const noteDurations = ['4', '4', '8', '8', '2'] as const
    let currentBar = 0

    while (currentBar < bars) {
        const chordDegree = progression[currentBar % progression.length]
        const barNoteCount = 2 + Math.floor(rng() * 4)

        for (let n = 0; n < barNoteCount; n++) {
            const useChordTone = rng() > 0.4
            let pitch: number

            if (useChordTone) {
                const chordNotes = getChordNotes(root, scale, chordDegree, octave)
                pitch = chordNotes[Math.floor(rng() * chordNotes.length)]
            } else {
                pitch = scaleNotes[Math.floor(rng() * scaleNotes.length)]
            }

            const duration = noteDurations[Math.floor(rng() * noteDurations.length)]
            const velocity = 60 + Math.floor(rng() * 40)

            melodyTrack.addEvent(new MidiWriter.NoteEvent({
                pitch: [midiNoteToName(pitch)],
                duration,
                velocity,
            }))
        }
        currentBar++
    }

    const chordTrack = new MidiWriter.Track()
    chordTrack.setTempo(tempo)
    chordTrack.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 5 })) // Electric piano

    for (let bar = 0; bar < bars; bar++) {
        const chordDegree = progression[bar % progression.length]
        const chordNotes = getChordNotes(root, scale, chordDegree, octave - 1)
        const velocity = 45 + Math.floor(rng() * 25)

        const arpeggiate = rng() > 0.5
        if (arpeggiate) {
            chordNotes.forEach((note, i) => {
                chordTrack.addEvent(new MidiWriter.NoteEvent({
                    pitch: [midiNoteToName(note)],
                    duration: '8',
                    velocity: velocity - i * 5,
                }))
            })
        } else {
            chordTrack.addEvent(new MidiWriter.NoteEvent({
                pitch: chordNotes.map(midiNoteToName),
                duration: '2',
                velocity,
            }))
        }
    }

    const bassTrack = new MidiWriter.Track()
    bassTrack.setTempo(tempo)
    bassTrack.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 33 })) // Bass guitar

    for (let bar = 0; bar < bars; bar++) {
        const chordDegree = progression[bar % progression.length]
        const bassNote = getChordNotes(root, scale, chordDegree, octave - 2)[0]
        const walkUp = rng() > 0.5

        bassTrack.addEvent(new MidiWriter.NoteEvent({
            pitch: [midiNoteToName(bassNote)],
            duration: '4',
            velocity: 70 + Math.floor(rng() * 20),
        }))

        if (walkUp) {
            bassTrack.addEvent(new MidiWriter.NoteEvent({
                pitch: [midiNoteToName(bassNote + 2)],
                duration: '4',
                velocity: 65,
            }))
            bassTrack.addEvent(new MidiWriter.NoteEvent({
                pitch: [midiNoteToName(bassNote + 4)],
                duration: '2',
                velocity: 60,
            }))
        } else {
            bassTrack.addEvent(new MidiWriter.NoteEvent({
                pitch: [midiNoteToName(bassNote)],
                duration: '2',
                velocity: 65,
            }))
            bassTrack.addEvent(new MidiWriter.NoteEvent({
                pitch: [midiNoteToName(bassNote)],
                duration: '4',
                velocity: 60,
            }))
        }
    }


    const writer = new MidiWriter.Writer([melodyTrack, chordTrack, bassTrack])
    const base64 = writer.base64()
    return Buffer.from(base64, 'base64')
}