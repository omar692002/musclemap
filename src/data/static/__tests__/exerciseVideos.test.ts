import { describe, it, expect } from 'vitest'
import rawExercises from '../source/exercises.json'
import type { RawExercise } from '../source/sourceSchema'
import { EXERCISE_VIDEO_IDS } from '../exerciseVideos'

const IDS = new Set((rawExercises as readonly RawExercise[]).map((exercise) => exercise.id))
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

describe('exercise video curation', () => {
  it('every mapped key is a real exercise id (catches typos)', () => {
    const unknown = Object.keys(EXERCISE_VIDEO_IDS).filter((id) => !IDS.has(id))
    expect(unknown).toEqual([])
  })

  it('every value is a well-formed YouTube id', () => {
    const bad = Object.values(EXERCISE_VIDEO_IDS).filter((videoId) => !YOUTUBE_ID.test(videoId))
    expect(bad).toEqual([])
  })
})
