/**
 * Curated exercise → demo video mapping (the project's value-add over the raw
 * dataset, which ships images only). Values are **YouTube video ids**.
 *
 * Source: DeltaBolic (Andrew Kwong) form-guide Shorts — https://www.youtube.com/@DeltaBolic/shorts
 * Every id below was extracted from the channel's shorts listing and matched by
 * hand to the closest exercise in the catalog. This is a data-only seam: add a
 * row and the video appears on that exercise (and its thumbnail on the card)
 * with zero UI changes. Embedding stays within YouTube's terms (PFA / academic
 * use); licensed or coach-authored uploads replace this in T1.
 *
 * Keys are free-exercise-db ids (see data/static/source/exercises.json).
 */
export const EXERCISE_VIDEO_IDS: Readonly<Record<string, string>> = {
  // Chest
  Dumbbell_Bench_Press: 'tdYLpdsY3Lw', // "The PERFECT DB Chest Press"
  'Barbell_Bench_Press_-_Medium_Grip': 'PTzUJkPrrDw', // "Bench Press Form Guide"
  'Wide-Grip_Barbell_Bench_Press': 'to90att_mR8', // "Bench Press Grip Widths (KNOW THE DIFFERENCE!)"
  'Dips_-_Chest_Version': 'eicOUO9WaJc', // "Dips — KNOW THE DIFFERENCE!"
  Machine_Bench_Press: '1FoWlRS2Edc', // "Machine Chest Press Variations (TRY THESE!)"
  Leverage_Chest_Press: '1FoWlRS2Edc',
  Cable_Chest_Press: '79Wdpx9b4uY', // "Cable Chest Press Variations"
  Standing_Cable_Chest_Press: '79Wdpx9b4uY',
  Cable_Crossover: 'YpQansy246A', // "Cable Chest Exercise Variations (DO THESE!)"
  Incline_Cable_Flye: 'zECTZHrvuMg', // "Seated Cable Chest Fly Variations (DO THESE!)"
  Butterfly: 'mC7UAo82QMw', // "Pec Fly Mistake"
  Pushups: 'Ogn23cN8iFY', // "Fix THESE Pushup Mistakes!"
  // Shoulders (lateral delts)
  Side_Lateral_Raise: 'Kl3LEzQ5Zqs', // "The PERFECT Lateral Raise (DO THIS!)"
  Seated_Side_Lateral_Raise: 'Kl3LEzQ5Zqs',
  Cable_Seated_Lateral_Raise: '9ilIKuy6B0g', // "STOP Making This Cable Lateral Raise Mistake!"
  'Lateral_Raise_-_With_Bands': 'yuR2ma8f_-k', // "Lateral Raise HACK!"
  'Standing_Low-Pulley_Deltoid_Raise': 'oAlhGm6_Qh4', // "Cable Lateral Raise Complete Guide"
  // Shoulders (presses & general)
  Dumbbell_Shoulder_Press: 'geDnKLneHV4', // "Dumbbell Shoulder Exercise Variations (TRY THESE!)"
  Seated_Dumbbell_Press: '0z7pUOCPaBc', // "Build 3D Shoulders Using Dumbbells Only!"
  Machine_Shoulder_Military_Press: 'hY-OdFoTwZI', // "Shoulder Press Machine Mistake (DON'T DO THIS!)"
  Leverage_Shoulder_Press: 'hY-OdFoTwZI',
  Cable_Shoulder_Press: 'bk97RAShIv4', // "Cable Shoulder Workout (HIT ALL 3 HEADS!)"
  Seated_Cable_Shoulder_Press: 'bk97RAShIv4',
  Smith_Machine_Overhead_Shoulder_Press: 'fQVzZZQB-Qs', // "Smith Machine Workout for Shoulders"
  Smith_Machine_Upright_Row: 'XRFWoiyWU78', // "4 Smith Machine Shoulder Exercises You Need to Try"
  // Shoulders (rear delts)
  Reverse_Machine_Flyes: 'H5UxZFl0lgk', // "The PERFECT Rear Delt Machine Fly"
  Reverse_Flyes: '9WpNWAM782Y', // "Rear Delt Dumbbell Fly Form Guide"
  Face_Pull: 'ggc7g88q15s', // "Don't Make This Facepull Mistake!"
  // Back (lats & rows)
  'Wide-Grip_Lat_Pulldown': '7jBmlCq5QzQ', // "Do Lat Pulldowns LIKE THIS!"
  'Close-Grip_Front_Lat_Pulldown': 'RFgiCDJs8Nk', // "Lat Pulldown Variations"
  'V-Bar_Pulldown': '2pb0rbxV62U', // "Pulldown Exercise Variations"
  Underhand_Cable_Pulldowns: '2pb0rbxV62U',
  'Straight-Arm_Pulldown': 'k6zaPZbB8yI', // "Straight-Arm Pulldown COMPLETE Guide"
  'Rope_Straight-Arm_Pulldown': 'k6zaPZbB8yI',
  Bent_Over_Barbell_Row: 'Cow3ESXmrTU', // "Barbell Row Grip Width & Muscles Worked"
  Seated_Cable_Rows: '7jDS4VQc43k', // "Target Different Back Muscles on Cable Rows"
  'Seated_One-arm_Cable_Pulley_Rows': '4-258XRGL2g', // "Stop Using Your Biceps On The Cable Row!"
  'One-Arm_Dumbbell_Row': 'AfBJ6f_e6SA', // "Dumbbell Row Mistakes You Need to Fix"
  'Bent_Over_Two-Dumbbell_Row': 'O-wYDpsJR3E', // "Dumbbell Back Exercise Variations (DO THESE!)"
  Dumbbell_Incline_Row: 'h3gCuCs7pks', // "Dumbbell Back Exercise Variations (TRY THESE!)"
  // Triceps
  Triceps_Pushdown: '-PqzEk57xiw', // "The PERFECT Triceps Pushdown"
  'Triceps_Pushdown_-_Rope_Attachment': '1FjkhpZsaxc', // "The Perfect Triceps Pushdown (DO THIS!)"
  'Triceps_Pushdown_-_V-Bar_Attachment': 'x2wGzN39JQQ', // "Do Triceps Pushdown LIKE THIS!"
  'Dips_-_Triceps_Version': 'eicOUO9WaJc', // "Dips — KNOW THE DIFFERENCE!"
  Lying_Triceps_Press: 'ZzeiSNGJOeE', // "Fix Your Lying Tricep Extensions!"
  Lying_Dumbbell_Tricep_Extension: 'ZzeiSNGJOeE',
  Triceps_Overhead_Extension_with_Rope: 'jeOcumrpoVA', // "Overhead Triceps Complete Guide"
  Cable_Rope_Overhead_Triceps_Extension: 'jeOcumrpoVA',
  Standing_Dumbbell_Triceps_Extension: 'jeOcumrpoVA',
  // Biceps
  Dumbbell_Bicep_Curl: 'E-Ru1nwKiQ4', // "Want WIDER Biceps? DO THIS!"
  Barbell_Curl: 'bCd7Xil89F8', // "Bicep Curl Mistakes (FIX THESE!)"
  Incline_Dumbbell_Curl: '7kzP_trBqQA', // "2 Best Exercises for Complete Biceps Growth"
  Standing_Biceps_Cable_Curl: 'Aa0MJEcktWA', // "Bayesian Curl Complete Guide"
  'Standing_One-Arm_Cable_Curl': 'Aa0MJEcktWA',
  // Legs
  Leg_Press: '2l7GcTciDUE', // "Leg Press Mistakes You NEED to Fix"
  Leg_Extensions: 'onIm6KNYATM', // "Do Leg Extensions LIKE THIS!"
  'Single-Leg_Leg_Extension': 'onIm6KNYATM',
  Hack_Squat: 'KBEF9XsiJ-w', // "Hack Squat Machine Variations (DO THESE!)"
  Smith_Machine_Squat: 'tSU-zAc4Ngc', // "Smith Machine Leg Variations You Need to Try"
  Dumbbell_Squat: 'D36UNbcwK9s', // "DUMBBELL-ONLY LEG WORKOUT (DO THIS!)"
  Dumbbell_Lunges: 'BIZhK4kulnk', // "TRY THESE Dumbbell Leg Exercises!"
  Split_Squat_with_Dumbbells: '0UnyLQ51F_c', // "The PERFECT Bulgarian Split Squat"
  One_Leg_Barbell_Squat: '0UnyLQ51F_c',
  Barbell_Hip_Thrust: 'CZX6w2ewbFU', // "Hip Thrust Foot Placement & Muscles Worked"
  Thigh_Abductor: 'AzIKrHSBrVo', // "Hip Abduction Variations (KNOW THE DIFFERENCE!)"
}
