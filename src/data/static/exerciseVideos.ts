/**
 * Curated exercise → demo video mapping (the project's value-add over the raw
 * dataset, which ships images only). Values are **YouTube video ids**.
 *
 * Source: DeltaBolic (Andrew Kwong) form-guide Shorts — https://www.youtube.com/@DeltaBolic/shorts
 * Every id below comes from a DOM harvest of the channel's full shorts listing
 * (scripts/harvest-shorts.mjs → scripts/shorts-list.txt) and was matched by
 * hand to the closest exercise in the catalog. This is a data-only seam: add a
 * row and the video appears on that exercise (and a play badge on its card)
 * with zero UI changes. Embedding stays within YouTube's terms (PFA / academic
 * use); licensed or coach-authored uploads replace this in T1.
 *
 * Keys are free-exercise-db ids (see data/static/source/exercises.json).
 */
export const EXERCISE_VIDEO_IDS: Readonly<Record<string, string>> = {
  // ── Chest ────────────────────────────────────────────────────────────────
  Dumbbell_Bench_Press: 'tdYLpdsY3Lw', // The PERFECT DB Chest Press
  Dumbbell_Bench_Press_with_Neutral_Grip: 'mTaiQemkEpU', // The PERFECT Dumbbell Chest Press
  'Barbell_Bench_Press_-_Medium_Grip': 'PTzUJkPrrDw', // Bench Press Form Guide
  'Bench_Press_-_Powerlifting': '5NStATS0zrw', // The PERFECT Bench Press
  'Wide-Grip_Barbell_Bench_Press': 'D36UNbcwK9s', // Bench Press Grip Widths
  'Close-Grip_Barbell_Bench_Press': 'xXd7sddHGa0', // Close-grip bench press guide
  Decline_Barbell_Bench_Press: 'NliSiO1AZ_8', // Bench Press Angles & Muscles Worked
  'Barbell_Incline_Bench_Press_-_Medium_Grip': 'Uf2To5LoYBE', // Incline Bench Press LIKE THIS
  Incline_Dumbbell_Press: '8fXfwG4ftaQ', // The PERFECT Incline Dumbbell Chest Press
  Hammer_Grip_Incline_DB_Bench_Press: 'oS2Uy3MAbgs', // Incline Dumbbell Press Guide
  Smith_Machine_Bench_Press: 'XFYMLdlaq04', // Smith machine bench guide
  Smith_Machine_Incline_Bench_Press: 'VXaBbUYMfIs', // PERFECT Smith incline bench
  Machine_Bench_Press: 'VHIlmOPMWWs', // The PERFECT Machine Chest Press
  Leverage_Chest_Press: 'Qu7-ceCvq7w', // The PERFECT Machine Chest Press
  Leverage_Incline_Chest_Press: 'KfDDkDOHO5c', // Machine bench press variations
  Leverage_Decline_Chest_Press: '0m8-vmy05SI', // Machine chest press variations
  Cable_Chest_Press: 'FHeLHhTth8w', // Do Cable Chest Presses LIKE THIS
  Standing_Cable_Chest_Press: '4-258XRGL2g', // Cable bench press variations
  Cable_Crossover: '14VcTQz6h-8', // The PERFECT Cable Chest Fly
  Low_Cable_Crossover: 'RAMvlJhBRxk', // Cable Chest Exercise Variations
  Flat_Bench_Cable_Flyes: 'gmoycnTM8LA', // Seated Cable Chest Fly Variations
  Butterfly: 'a9vQ_hwIksU', // The PERFECT Pec Dec Fly
  Dumbbell_Flyes: 'hKe5WG-zZRM', // Do Chest Flyes LIKE THIS
  Pushups: 'EGShi0FcidE', // Do Pushups LIKE THIS
  'Single-Arm_Push-Up': 'bh9PsSfGZ2o', // The PERFECT One-Arm Pushup
  'Incline_Push-Up': 'SOu-3_YyX2c', // Pushup variations (upper/mid/lower chest)
  'Decline_Push-Up': 'SOu-3_YyX2c',
  'Push-Ups_-_Close_Triceps_Position': 'PPTj-MW2tcs', // Perfect Diamond Push-Up
  'Dips_-_Chest_Version': 'eicOUO9WaJc', // Dips — KNOW THE DIFFERENCE
  'Bent-Arm_Dumbbell_Pullover': '6yYVcIOAERY', // Dumbbell pullover variations
  'Straight-Arm_Dumbbell_Pullover': '6yYVcIOAERY',
  'Bent-Arm_Barbell_Pullover': '8W2HkeypREE', // Pullover vs lying triceps extension
  // ── Shoulders ────────────────────────────────────────────────────────────
  Side_Lateral_Raise: 'Kl3LEzQ5Zqs', // The Perfect Lateral Raise
  Seated_Side_Lateral_Raise: 'lMYs7FY8os4', // The PERFECT Lateral Raise
  Cable_Seated_Lateral_Raise: '9ilIKuy6B0g', // Cable lateral raise mistake
  'Standing_Low-Pulley_Deltoid_Raise': 'JlT2xB92lY8', // Cable lateral raise complete guide
  'Lateral_Raise_-_With_Bands': 'yuR2ma8f_-k', // Lateral Raise HACK
  Front_Dumbbell_Raise: 'eJ_HNftboic', // Front raise mistake
  'Front_Two-Dumbbell_Raise': 'eJ_HNftboic',
  Dumbbell_Shoulder_Press: 'k6tzKisR3NY', // The PERFECT Dumbbell Shoulder Press
  Standing_Dumbbell_Press: '2l7GcTciDUE', // Dumbbell shoulder exercise variations
  Seated_Dumbbell_Press: 'itPRZuhHNBg', // Set up your DB shoulder press like this
  Machine_Shoulder_Military_Press: '6v4nrRVySj0', // The PERFECT Machine Shoulder Press
  Leverage_Shoulder_Press: '58VrYLydDPE', // Machine shoulder press grip & position guide
  Smith_Machine_Overhead_Shoulder_Press: 'E7ngsffMPR0', // PERFECT Smith Machine Shoulder Press
  Standing_Military_Press: '4LBVP2Oe7fg', // The PERFECT Barbell Overhead Press
  Barbell_Shoulder_Press: '4LBVP2Oe7fg',
  Seated_Barbell_Military_Press: 'zoN5EH50Dro', // Perfect Overhead Press Form
  Cable_Shoulder_Press: 'AfBJ6f_e6SA', // Cable Shoulder Workout (all 3 heads)
  Seated_Cable_Shoulder_Press: 'AfBJ6f_e6SA',
  Smith_Machine_Upright_Row: 'KqobVMSpqfE', // 4 Smith machine shoulder exercises
  'Smith_Machine_One-Arm_Upright_Row': 'KqobVMSpqfE',
  Upright_Barbell_Row: 'IYfLFuGKFLI', // Upright row mistake
  Standing_Dumbbell_Upright_Row: '29-4QWdqd-g', // Dumbbell upright row variations
  'Dumbbell_One-Arm_Upright_Row': '29-4QWdqd-g',
  Reverse_Flyes: '9WpNWAM782Y', // Rear delt dumbbell fly form guide
  Reverse_Machine_Flyes: 'H5UxZFl0lgk', // The PERFECT Rear Delt Machine Fly
  Cable_Rear_Delt_Fly: 'cGXBVOc5xIk', // PERFECT cross-cable rear delt fly
  'Seated_Bent-Over_Rear_Delt_Raise': 'LsT-bR_zxLo', // PERFECT dumbbell rear delt fly
  Face_Pull: 'ywQsaOTRjzM', // Do Face Pulls LIKE THIS
  'Cable_Rope_Rear-Delt_Rows': 'naoYdHwwrR4', // Rear-delt row mistakes
  // ── Back ─────────────────────────────────────────────────────────────────
  'Wide-Grip_Lat_Pulldown': '7jBmlCq5QzQ', // Do Lat Pulldowns LIKE THIS
  'Close-Grip_Front_Lat_Pulldown': 'RFgiCDJs8Nk', // Lat pulldown variations
  'Full_Range-Of-Motion_Lat_Pulldown': 'bNmvKpJSWKM', // The PERFECT Lat Pulldown
  'V-Bar_Pulldown': '7Cjc_aXoQ_I', // Pulldown Variations
  Underhand_Cable_Pulldowns: '7kzP_trBqQA', // Target different back muscles on pulldowns
  'Straight-Arm_Pulldown': 'hAMcfubonDc', // The Perfect Straight Arm Pulldown
  'Rope_Straight-Arm_Pulldown': 'zECTZHrvuMg', // Straight-arm pulldown complete guide
  Pullups: 'eDP_OOhMTZ4', // The Perfect Pull-Up
  'Chin-Up': 'kLmFCtNDut4', // Pull-up variations (know the difference)
  'Band_Assisted_Pull-Up': 'kFgKN1StH2s', // Band-assisted pull-up tip
  Bent_Over_Barbell_Row: 'phVtqawIgbk', // The PERFECT Barbell Row
  'Reverse_Grip_Bent-Over_Rows': 'PdbAZdPzBgc', // Barbell row grip widths & muscles worked
  Smith_Machine_Bent_Over_Row: '2fFIRmW5Quw', // Smith machine row variations
  Seated_Cable_Rows: 'wAU8VdcRAMQ', // The PERFECT Cable Row
  'Seated_One-arm_Cable_Pulley_Rows': 'yIvvQc2Z6uM', // One-arm cable row variations
  Low_Pulley_Row_To_Neck: 'uiAeKNCF8Y8', // Low-pulley row variations
  Leverage_Iso_Row: 'G35gTqGcXXA', // Chest-supported row variations
  'One-Arm_Dumbbell_Row': 'WkFX6_GxAs8', // The PERFECT Dumbbell Row
  'Bent_Over_Two-Dumbbell_Row': 'CZX6w2ewbFU', // Dumbbell back exercise variations
  'Bent_Over_Two-Dumbbell_Row_With_Palms_In': 'BgDBslWogRI', // Pronated vs supinated dumbbell row
  Dumbbell_Incline_Row: 'OfYTPoQUvVc', // Dumbbell back exercise variations
  'T-Bar_Row_with_Handle': 'Sr2q7i-i8X0', // The PERFECT Landmine Row
  Hyperextensions_Back_Extensions: 'nGkITCtyMRc', // Hyperextensions: lower back vs glutes
  Hyperextensions_With_No_Hyperextension_Bench: '8rXdAAwm8Rs', // Hyperextension (know the difference)
  Barbell_Deadlift: 'xNwpvDuZJ3k', // The PERFECT Deadlift
  Romanian_Deadlift: 'uTA4GWNwUEo', // Romanian deadlift mistake
  'Stiff-Legged_Barbell_Deadlift': 'Wou9zVQrAfs', // Romanian vs stiff-leg deadlift
  'Stiff-Legged_Dumbbell_Deadlift': 'hu3jRvTc_po', // The PERFECT Dumbbell Romanian Deadlift
  Barbell_Shrug: 'r37wwZeCNp4', // Build bigger traps
  Dumbbell_Shrug: 'rFsSeClGnNA', // Dumbbell shrug mistakes
  Leverage_Shrug: 'h0zFdmOH-K0', // Shrug like this for bigger traps
  // ── Biceps ───────────────────────────────────────────────────────────────
  Dumbbell_Bicep_Curl: 'E-Ru1nwKiQ4', // Want WIDER biceps? Do this
  Dumbbell_Alternate_Bicep_Curl: '_aoad2yuP5w', // Dumbbell curl variations
  Barbell_Curl: '54x2WF1_Suc', // The Perfect Barbell Bicep Curl
  'Wide-Grip_Standing_Barbell_Curl': 'ez3YoWf62Eg', // Inner/outer biceps on barbell curl
  'Close-Grip_Standing_Barbell_Curl': 'ez3YoWf62Eg',
  'EZ-Bar_Curl': 'Qemb2cWVOd8', // Curl grips & muscles worked
  Incline_Dumbbell_Curl: 'uCUaRFlA9vE', // PERFECT incline biceps curl
  Alternate_Incline_Dumbbell_Curl: 'MPq3rlGjC1Y', // Incline bicep curls done wrong
  Preacher_Curl: 'WyAVZn6_PIY', // PERFECT Preacher Curl form
  Machine_Preacher_Curls: 'S4dDLfp3e8w', // The PERFECT Machine Preacher Curl
  'Standing_One-Arm_Cable_Curl': 'w3sXATQzGvc', // The PERFECT Bayesian Curl
  Standing_Biceps_Cable_Curl: 'CrbTqNOlFgE', // The PERFECT Cable Bicep Curl
  'Cable_Hammer_Curls_-_Rope_Attachment': 'xLEpXce3-SA', // Cable curl variations
  Hammer_Curls: '2LpuygMBn4Q', // Dumbbell curl grips (know the difference)
  Concentration_Curls: 'I_bKCYL2nL8', // Do this on the concentration curl
  // ── Triceps ──────────────────────────────────────────────────────────────
  Triceps_Pushdown: '-PqzEk57xiw', // The PERFECT Triceps Pushdown
  'Triceps_Pushdown_-_Rope_Attachment': '1FjkhpZsaxc', // The Perfect Triceps Pushdown
  'Triceps_Pushdown_-_V-Bar_Attachment': '1FoWlRS2Edc', // Do Triceps Pushdown LIKE THIS
  'Dips_-_Triceps_Version': 'eicOUO9WaJc', // Dips — KNOW THE DIFFERENCE
  Parallel_Bar_Dip: '8Wqw9vjfvzY', // Dips: muscles worked
  Bench_Dips: 'jkTKsIME3Go', // The PERFECT Bench Dip
  Weighted_Bench_Dip: '4ua3MzaU0QU', // Le Bench Dip PARFAIT
  Lying_Triceps_Press: 'RetiLFQobXU', // The PERFECT Skull Crusher
  Lying_Dumbbell_Tricep_Extension: 'Mq9eoGIiCSU', // Lying dumbbell triceps extension mistake
  Standing_Dumbbell_Triceps_Extension: 'b_r_LW4HEcM', // PERFECT Overhead DB Tricep Extension
  Seated_Triceps_Press: 'J565P8FzJXA', // Overhead dumbbell triceps extension guide
  Triceps_Overhead_Extension_with_Rope: 'NTk0Igxqcsk', // PERFECT high-cable overhead extension
  Cable_Rope_Overhead_Triceps_Extension: 'oZ1MbUl-_-w', // Overhead cable extensions LIKE THIS
  Low_Cable_Triceps_Extension: '9Ark9S11uXw', // PERFECT low pulley overhead extensions
  Cable_One_Arm_Tricep_Extension: 'f59wGKbXZ0w', // Cable triceps exercises (all heads)
  Tricep_Dumbbell_Kickback: 'WhBxKbe1-NU', // The PERFECT Triceps Kickback
  // ── Legs ─────────────────────────────────────────────────────────────────
  Barbell_Squat: 'dW3zj79xfrc', // The PERFECT Barbell Squat
  Barbell_Full_Squat: 'dW3zj79xfrc',
  Front_Barbell_Squat: '_qv0m3tPd3s', // The PERFECT Front Squat
  Goblet_Squat: 'ZBAd1g1z6qs', // Goblet Squat Variations
  Dumbbell_Squat: 'cuUPtfanAFQ', // Dumbbell squat (know the difference)
  Smith_Machine_Squat: 'iKCJCydYYrE', // The PERFECT Smith Machine Squat
  Hack_Squat: 'Ogn23cN8iFY', // Hack squat machine variations
  Narrow_Stance_Hack_Squats: 'cFGgMO-ENiQ', // Hack squat variations (know the difference)
  Leg_Press: 'EotSw18oR9w', // The PERFECT Leg Press
  Narrow_Stance_Leg_Press: 'BnacvXdaxq8', // Leg press variations
  Smith_Machine_Leg_Press: 'x2wGzN39JQQ', // Smith machine leg variations
  Leg_Extensions: 'uM86QE59Tgc', // The PERFECT Leg Extension
  'Single-Leg_Leg_Extension': 'hY-OdFoTwZI', // Do Leg Extensions LIKE THIS
  Lying_Leg_Curls: 'EnZZIaPCb8k', // The PERFECT Leg Curl
  Seated_Leg_Curl: 'xdbEG3xGLI8', // Seated leg curl form tips
  Standing_Leg_Curl: '_lgE0gPvbik', // Leg curl form tips
  Barbell_Lunge: '1mHlkUC5rGY', // Lunge variations (know the difference)
  Dumbbell_Lunges: 'mJilHWIBWO8', // The PERFECT Dumbbell Static Lunge
  Dumbbell_Rear_Lunge: 'Ms9Hph1TQDA', // Forward / reverse / curtsy lunges
  One_Leg_Barbell_Squat: 'Cow3ESXmrTU', // The PERFECT Bulgarian Split Squat
  Split_Squat_with_Dumbbells: 'Cow3ESXmrTU',
  Split_Squats: 'T9-g2VBFhNU', // Split squat mistake
  Barbell_Hip_Thrust: 'KBEF9XsiJ-w', // Hip thrust foot placement & muscles worked
  Barbell_Glute_Bridge: '96uDbymTaHM', // Hip thrust variations
  Single_Leg_Glute_Bridge: 'JlGt_Sn4OSM', // Single-leg stability ball hip thrust
  Physioball_Hip_Bridge: 'JlGt_Sn4OSM',
  Glute_Kickback: 'H5-zZ4zwios', // Glute kickback variations & muscles worked
  'One-Legged_Cable_Kickback': 'UbOcViik3hk', // Glute kickback variations
  Thigh_Abductor: 'llIGQ2HeqKU', // Hip abduction variations
  Standing_Calf_Raises: 'ey9a2M71-vU', // Calf raises: inner vs outer
  Seated_Calf_Raise: 'a-x_NR-ibos', // Calf raise variations
  Standing_Dumbbell_Calf_Raise: 'XdlMH3nUBM0', // Bigger calves (dumbbells only)
  Standing_Barbell_Calf_Raise: 'wdOkFomQNp8', // Build bigger calves
  Smith_Machine_Calf_Raise: 'FV3a0w1LFeQ', // Wanna bigger calves? Do these
  Calf_Press_On_The_Leg_Press_Machine: 'N1Qn84y9i3s', // Struggling to grow calves
  // ── Core ─────────────────────────────────────────────────────────────────
  Crunches: 'ZKw4t23ERuw', // Stop doing ab crunches like this
  'Sit-Up': 'aP4HfrLkOLU', // Abs exercise variations
  Cable_Crunch: 'RQjrmGTbxjI', // Fix your cable crunch mistakes
  Rope_Crunch: 'rf_wTA6EDus', // Don't do cable crunches like this
  Plank: 'xe2MXatLTUw', // The PERFECT Plank
  Flat_Bench_Lying_Leg_Raise: '5uB0KaoCF9w', // Lying leg raise mistake
  // ── Forearms ─────────────────────────────────────────────────────────────
  'Seated_Dumbbell_Palms-Up_Wrist_Curl': 'mwfM_0xBh1s', // Forearm workout (dumbbells only)
  Cable_Wrist_Curl: 'cocFB-38xgA', // Bigger 3D forearms with cables
  'Palms-Up_Barbell_Wrist_Curl_Over_A_Bench': 'DRCSpntjwRw', // Barbell forearm workout
}
