/**
 * Curated exercise → demo video mapping (the project's value-add over the raw
 * dataset, which ships images only). Values are **YouTube video ids**.
 *
 * Source: DeltaBolic (Andrew Kwong) form-guide Shorts — https://www.youtube.com/@DeltaBolic/shorts
 * Each id was matched by hand to the closest exercise in the catalog. This is a
 * data-only seam: add a row and the video appears on that exercise (and its
 * thumbnail on the card) with zero UI changes. Grows toward full coverage here,
 * or via coach-authored uploads in T1.
 *
 * Keys are free-exercise-db ids (see data/static/source/exercises.json).
 */
export const EXERCISE_VIDEO_IDS: Readonly<Record<string, string>> = {
  // Chest
  Dumbbell_Bench_Press: 'tdYLpdsY3Lw', // "The PERFECT DB Chest Press"
  'Barbell_Bench_Press_-_Medium_Grip': 'PTzUJkPrrDw', // "Bench Press Form Guide"
  'Dips_-_Chest_Version': 'eicOUO9WaJc', // "Dips — KNOW THE DIFFERENCE!"
  // Shoulders (lateral delts)
  Side_Lateral_Raise: 'Kl3LEzQ5Zqs', // "The PERFECT Lateral Raise (DO THIS!)"
  Seated_Side_Lateral_Raise: 'Kl3LEzQ5Zqs',
  Cable_Seated_Lateral_Raise: '9ilIKuy6B0g', // "STOP Making This Cable Lateral Raise Mistake!"
  'Lateral_Raise_-_With_Bands': 'yuR2ma8f_-k', // "Lateral Raise HACK!"
  // Shoulders (rear delts)
  Reverse_Machine_Flyes: 'H5UxZFl0lgk', // "The PERFECT Rear Delt Machine Fly"
  Reverse_Flyes: '9WpNWAM782Y', // "Rear Delt Dumbbell Fly Form Guide"
  Face_Pull: '7iXk2Eylbv4', // "Rope Pulling Exercise Variations"
  // Back (lats)
  'Wide-Grip_Lat_Pulldown': '7jBmlCq5QzQ', // "Do Lat Pulldowns LIKE THIS!"
  'Close-Grip_Front_Lat_Pulldown': 'RFgiCDJs8Nk', // "Lat Pulldown Variations"
  // Triceps
  Triceps_Pushdown: '-PqzEk57xiw', // "The PERFECT Triceps Pushdown"
  'Triceps_Pushdown_-_Rope_Attachment': '1FjkhpZsaxc', // "The Perfect Triceps Pushdown (DO THIS!)"
  'Dips_-_Triceps_Version': 'eicOUO9WaJc', // "Dips — KNOW THE DIFFERENCE!"
  // Biceps
  Dumbbell_Bicep_Curl: 'E-Ru1nwKiQ4', // "Want WIDER Biceps? DO THIS!"
}
