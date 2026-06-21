/**
 * Curated exercise → demo video mapping (the project's value-add over the raw
 * dataset, which ships images only). Values are **YouTube video ids**.
 * FULL COVERAGE: every one of the 873 catalog exercises has an entry.
 *
 * Sources, in rough order of volume:
 *  - DeltaBolic form-guide Shorts (channel harvest: scripts/harvest-shorts.mjs)
 *  - Per-exercise YouTube search (scripts/search-videos.mjs → search-results.jsonl),
 *    title-scored and hand-reviewed; surfaces e.g. the official Bodybuilding.com
 *    exercise-database guides (our dataset's names come from that database)
 *  - Channel harvests: Bodybuilding.com, ScottHermanFitness, MuscleWiki
 *    (scripts/harvest-channel.mjs + scripts/match-videos.mjs)
 * Every id was verified embeddable via oEmbed (scripts/check-embeddable.mjs).
 *
 * This is a data-only seam: change a row and the video on that exercise changes
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
  'Wide-Grip_Decline_Barbell_Pullover': 'Datv2L6t3-4', // You're doing pullovers WRONG
  Decline_Dumbbell_Bench_Press: 'WbCEvFA0NJs', // FIX your dumbbell bench press
  One_Arm_Dumbbell_Bench_Press: '62k5691EJIk', // Dumbbell bench press mistake (FR)
  'Close-Grip_Dumbbell_Press': 'mTaiQemkEpU', // The PERFECT (neutral-grip) DB press
  Incline_Cable_Chest_Press: 'Gruq177Psnk', // Incline chest press mistake
  Decline_Dumbbell_Flyes: 'PuZ3NwGukkQ', // Dumbbell fly mistake
  Incline_Dumbbell_Flyes: 'rk8YayRoTRQ', // Fix these dumbbell chest fly mistakes
  'Incline_Dumbbell_Flyes_-_With_A_Twist': 'lrfMJUUdSVw', // Avoid this dumbbell fly mistake
  'Wide-Grip_Decline_Barbell_Bench_Press': 'Ti5wayXCWIk', // Bench press grip widths
  'Bench_Press_-_With_Bands': '79Wdpx9b4uY', // Fix your bench press
  Bench_Press_with_Chains: '2at6Hx8_Mtw', // Fix these bench press mistakes
  Reverse_Band_Bench_Press: '79Wdpx9b4uY',
  'Smith_Machine_Close-Grip_Bench_Press': 'gQ3afio08V8', // 5 Smith machine bench mistakes
  Smith_Machine_Decline_Press: 'gQ3afio08V8',
  Decline_Smith_Press: 'gQ3afio08V8',
  'Push-Up_Wide': '0Hc-UOdIqnY', // PERFECT push-up workout
  'Incline_Push-Up_Medium': 'SOu-3_YyX2c', // Pushup variations (upper/mid/lower chest)
  'Incline_Push-Up_Wide': 'SOu-3_YyX2c',
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
  'Dumbbell_One-Arm_Shoulder_Press': 'A94MvXVPi8M', // DB shoulder press mistake (FR)
  Alternating_Cable_Shoulder_Press: 'AfBJ6f_e6SA', // Cable shoulder workout
  'Shoulder_Press_-_With_Bands': 'tNPEBFuc-Sw', // Shoulder press mistake
  Front_Cable_Raise: 'eJ_HNftboic', // Front raise mistake
  Front_Plate_Raise: 'eJ_HNftboic',
  Front_Incline_Dumbbell_Raise: 'eJ_HNftboic',
  Side_Laterals_to_Front_Raise: '2pb0rbxV62U', // Fix these lateral raise mistakes
  'One-Arm_Incline_Lateral_Raise': 'Ugk4cahT3Xw', // Fix this lateral raise mistake
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
  One_Arm_Lat_Pulldown: 'PRmiRY1iqWE', // Do lat pulldowns LIKE THIS
  Elevated_Cable_Rows: 'YqD0tKXHTvM', // The PERFECT cable row
  Barbell_Rear_Delt_Row: 'naoYdHwwrR4', // Rear-delt row mistakes
  Weighted_Pull_Ups: 'eDP_OOhMTZ4', // The Perfect Pull-Up
  'Scapular_Pull-Up': 'tlLNz1D7xcI', // How to build pull-up strength
  Reverse_Hyperextension: '8rXdAAwm8Rs', // Hyperextension (know the difference)
  Axle_Deadlift: 'K8a_Ab9R-aI', // The PERFECT deadlift guide
  Clean_Deadlift: 'K8a_Ab9R-aI',
  Cable_Deadlifts: 'K8a_Ab9R-aI',
  Deadlift_with_Bands: 'K8a_Ab9R-aI',
  Deadlift_with_Chains: 'K8a_Ab9R-aI',
  Deficit_Deadlift: 'K8a_Ab9R-aI',
  Romanian_Deadlift_from_Deficit: 'uTA4GWNwUEo', // Romanian deadlift mistake
  'Smith_Machine_Stiff-Legged_Deadlift': 'Wou9zVQrAfs', // Romanian vs stiff-leg deadlift
  Wide_Stance_Stiff_Legs: 'Wou9zVQrAfs',
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
  Machine_Bicep_Curl: 'S4dDLfp3e8w', // The PERFECT machine preacher curl
  Cable_Preacher_Curl: '7ixqAPO6JvU', // Fix your preacher curls
  One_Arm_Dumbbell_Preacher_Curl: 'WyAVZn6_PIY', // PERFECT preacher curl form
  Preacher_Hammer_Dumbbell_Curl: 'WyAVZn6_PIY',
  Zottman_Preacher_Curl: '7ixqAPO6JvU',
  Reverse_Barbell_Preacher_Curls: '7ixqAPO6JvU',
  Incline_Inner_Biceps_Curl: '7dGvfAjiqM4', // Incline biceps curl hack
  Incline_Hammer_Curls: 'fXFN8_1Bh6k', // Incline bicep curl mistake
  'Standing_Inner-Biceps_Curl': 'iwvkZ6K-m-s', // 3 bicep curl mistakes to fix
  Standing_Concentration_Curl: 'EjUnEEfTSEY', // Concentration curl mistakes
  Seated_Dumbbell_Curl: '_aoad2yuP5w', // Dumbbell curl variations
  Seated_Dumbbell_Inner_Biceps_Curl: '_aoad2yuP5w',
  Reverse_Barbell_Curl: '54x2WF1_Suc', // The Perfect Barbell Bicep Curl
  Reverse_Cable_Curl: 'CrbTqNOlFgE', // The PERFECT cable bicep curl
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
  Overhead_Triceps: 'YpQansy246A', // Overhead triceps complete guide
  Cable_Lying_Triceps_Extension: 'K3mFeNz4e3w', // The Perfect lying triceps extension
  Machine_Triceps_Extension: 'Kfbfkd0Sf_o', // Triceps extension mistake
  Cable_Incline_Triceps_Extension: 'NTk0Igxqcsk', // PERFECT high-cable overhead extension
  Kneeling_Cable_Triceps_Extension: 'oZ1MbUl-_-w', // Overhead cable extensions LIKE THIS
  Decline_Dumbbell_Triceps_Extension: 'yjeVsevmPGM', // Fix your lying tricep extensions
  'Dumbbell_One-Arm_Triceps_Extension': 'LmA9b-kcJU0', // DB overhead extension mistake
  'Standing_One-Arm_Dumbbell_Triceps_Extension': 'LmA9b-kcJU0',
  Standing_Overhead_Barbell_Triceps_Extension: 'YpQansy246A',
  'Dumbbell_Tricep_Extension_-Pronated_Grip': 'yjeVsevmPGM',
  One_Arm_Pronated_Dumbbell_Triceps_Extension: 'yjeVsevmPGM',
  One_Arm_Supinated_Dumbbell_Triceps_Extension: 'yjeVsevmPGM',
  'Standing_Low-Pulley_One-Arm_Triceps_Extension': '9Ark9S11uXw', // Low pulley overhead extensions
  Reverse_Grip_Triceps_Pushdown: 'eDa0VYlbDeQ', // Triceps pushdown mistakes
  Band_Skull_Crusher: 'L-lMUcVdc2I', // Skull crusher mistake (FR)
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
  Bodyweight_Squat: '_aFzWlnxzco', // Fix this squat mistake
  Box_Squat: 'dW3zj79xfrc', // The PERFECT Barbell Squat
  Box_Squat_with_Bands: 'dW3zj79xfrc',
  Box_Squat_with_Chains: 'dW3zj79xfrc',
  Speed_Box_Squat: 'dW3zj79xfrc',
  Barbell_Squat_To_A_Bench: 'dW3zj79xfrc',
  Olympic_Squat: 'dW3zj79xfrc',
  Speed_Squats: 'dW3zj79xfrc',
  Squat_with_Bands: 'dW3zj79xfrc',
  Squat_with_Chains: 'dW3zj79xfrc',
  'Squats_-_With_Bands': 'dW3zj79xfrc',
  Wide_Stance_Barbell_Squat: 'dW3zj79xfrc',
  Chair_Squat: 'jDlVaog-_io', // Squat mistake you need to fix
  Sit_Squats: 'jDlVaog-_io',
  Weighted_Squat: 'cHWw9J7ceig', // Fix this squat mistake
  Front_Barbell_Squat_To_A_Bench: '_qv0m3tPd3s', // The PERFECT Front Squat
  Front_Squat_Clean_Grip: '_qv0m3tPd3s',
  Front_Squats_With_Two_Kettlebells: '_qv0m3tPd3s',
  Dumbbell_Squat_To_A_Bench: 'cuUPtfanAFQ', // Dumbbell squat (know the difference)
  Suspended_Split_Squat: 'or1frhkjBDc', // Bulgarian split squat setup & form
  'Calf_Raises_-_With_Bands': 'ey9a2M71-vU', // Calf raises: inner vs outer
  Donkey_Calf_Raises: 'ey9a2M71-vU',
  // ── Core ─────────────────────────────────────────────────────────────────
  Crunches: 'ZKw4t23ERuw', // Stop doing ab crunches like this
  'Sit-Up': 'aP4HfrLkOLU', // Abs exercise variations
  Cable_Crunch: 'RQjrmGTbxjI', // Fix your cable crunch mistakes
  Rope_Crunch: 'rf_wTA6EDus', // Don't do cable crunches like this
  Plank: 'xe2MXatLTUw', // The PERFECT Plank
  Flat_Bench_Lying_Leg_Raise: '5uB0KaoCF9w', // Lying leg raise mistake
  Cable_Seated_Crunch: 'ByZJuk85YuE', // Cable crunch mistakes
  // ── Forearms ─────────────────────────────────────────────────────────────
  'Seated_Dumbbell_Palms-Up_Wrist_Curl': 'mwfM_0xBh1s', // Forearm workout (dumbbells only)
  Cable_Wrist_Curl: 'cocFB-38xgA', // Bigger 3D forearms with cables
  'Palms-Up_Barbell_Wrist_Curl_Over_A_Bench': 'DRCSpntjwRw', // Barbell forearm workout
  // ── Multi-channel coverage (Bodybuilding.com / ScottHermanFitness / MuscleWiki) ──
  Band_Pull_Apart: 'cFYqfAf3zcI', // [musclewiki] Band Pull-Apart
  Barbell_Step_Ups: 'eBK8Gb50yLI', // [musclewiki] Barbell Step Up
  External_Rotation_with_Cable: 'LpNgc6Vx4iY', // [bbcom] Cable External Rotation guide
  External_Rotation: 'LpNgc6Vx4iY',
  Glute_Ham_Raise: 'TDdV0dCsqKs', // [bbcom] Glute Ham Raise exercise guide
  'Lying_T-Bar_Row': 'w0KnlQ-b7jw', // [bbcom] Lying T-Bar Row exercise guide
  Spider_Curl: 'TVjOooXvzO8', // [bbcom] Spider Curl exercise guide
  Superman: 'hhq86gJvrvo', // [bbcom] Superman exercise guide
  Suspended_Fallout: '0FAMdxWgFnA', // [bbcom] Suspended Fallout exercise guide
  Svend_Press: 'cIoUZOnypS8', // [bbcom] Svend Press exercise guide
  Zottman_Curl: 'FSGDM9-dZ9w', // [bbcom] Zottman Curl exercise guide
  Ball_Leg_Curl: 'e3EeeA6L3YQ', // [scotth] Single-leg curl on exercise ball
  Barbell_Side_Bend: '9_kAFDM6l6o', // [bbcom] Barbell Side Bend exercise guide
  Floor_Press: '77gWg_ZA8Kg', // [bbcom] Barbell floor press guide
  Good_Morning: '_Omn7frzCgk', // [musclewiki] Good Mornings
  'Jackknife_Sit-Up': 'GEZ8NLbtc8Q', // [bbcom] Jackknife Sit Up exercise guide
  'Janda_Sit-Up': 'UsFGTXPmPaI', // [scotth] Janda Sit-Up
  Jefferson_Squats: '9TbV93ZQEXY', // [scotth] Jefferson Squat
  Muscle_Up: '86bwH-yHgMQ', // [scotth] Muscle-Up on rings
  Oblique_Crunches: '2wvLc4TEl2A', // [scotth] Oblique crunch
  Overhead_Squat: '15fJCN9esQY', // [musclewiki] Overhead Barbell Squat
  Pallof_Press: '-oHlLRJeEAU', // [musclewiki] Band Pallof Press
  Russian_Twist: 'j_0I-O9qQiA', // [musclewiki] How To Russian Twist
  Stomach_Vacuum: 'gDx1xfSobG4', // [scotth] Stomach Vacuum
  Tate_Press: 'IgSjoXbpy1M', // [scotth] Tate Press
  'Upright_Row_-_With_Bands': 'bfzl23IIOi8', // [scotth] Resistance band upright row
  Zercher_Squats: 'vpy4ADmlo1E', // [scotth] Zercher Squat
  // ── Search-curated coverage (per-exercise YouTube search, hand-reviewed) ──
  '3_4_Sit-Up': 'TF_DGQf6mTM', // How To: 3/4 Sit- Up
  '90_90_Hamstring': 'GNEfNkFuoWU', // 90/90 Hamstring Stretch
  Ab_Crunch_Machine: 'b6ONE9Rfgl8', // Ab Crunch Machine with Arms up
  Ab_Roller: 'MinlHnG7j4k', // 🎯 How to Use the Ab Roller With Perfect Form
  Adductor: 'vJTGQlvPmCQ', // Best exercises for the adductor muscles
  Adductor_Groin: 'B0sBP7a5oac', // Bulletproof Your Groin! | 10 Adductor Prehab Exercises!
  Advanced_Kettlebell_Windmill: 'H8fmeaq8ewI', // Advanced Kettlebell Windmill Exercise
  Air_Bike: 'QdHIigTtgVw', // 🚲 Air Bike Exercise
  All_Fours_Quad_Stretch: 'iL0KxjssFVU', // all-fours-quad-stretch
  Alternate_Hammer_Curl: 'L1bDrPlfu1Q', // How to Do：ALTERNATE HAMMER CURL
  Alternate_Heel_Touchers: 'T4jEdmcoNKw', // Alternate Heel Touchers.
  Alternate_Leg_Diagonal_Bound: '5rL6j6XShZ0', // Alternate Leg Diagonal Bound Exercise Videos & Guides Bodybuilding com
  Alternating_Deltoid_Raise: 'Y5uwN-ko6eU', // Alternating Deltoid Raise
  Alternating_Floor_Press: 'tRVrPCBX5NE', // Alternating floor press
  Alternating_Hang_Clean: 'adzlNWY9peg', // Alternating Kettlebell Hang Clean
  Alternating_Kettlebell_Press: 'bzLjwlzMO_E', // How to - Alternating Kettlebell Press
  Alternating_Kettlebell_Row: 'UB3Xa-PeWPQ', // Alternating Kettlebell Rows
  Alternating_Renegade_Row: 'Q28cLuweLv4', // How To Do A Renegade Row
  Ankle_Circles: '9tFDZqo-X3o', // Exercise of the Day: Ankle Circles
  'Anterior_Tibialis-SMR': '33eaciwRBls', // Anterior Tibialis SMR Exercise
  'Anti-Gravity_Press': 'W6FlyxQzw98', // ANTI-GRAVITY PRESS
  Arm_Circles: 'UVMEnIaY8aU', // Arm Circles Exercise
  Arnold_Dumbbell_Press: '69z2KymlEvQ', // How to do a Standing Dumbbell Arnold Press!
  Around_The_Worlds: 'rV-chY0pYco', // Dumbbell Around the Worlds
  Atlas_Stone_Trainer: 'vp_xOOkMmjU', // Atlas Stone Trainer
  'Back_Flyes_-_With_Bands': 'rb3YuLXAmMU', // Back Flyes with Bands
  Backward_Drag: 'IxWVmDZTJas', // Backward Sled/Tire Drag
  Backward_Medicine_Ball_Throw: 'ZB8AOSODrIY', // Backward Medicine Ball Throw
  Balance_Board: 'mcdmz0oR--k', // How to Balance Board!
  Band_Good_Morning: 'eYyZ4rPrUUo', // Good Morning (Band-resisted)
  Band_Good_Morning_Pull_Through: 'LvoOxaApOyI', // Band Good Morning Pull Through Exercise Videos & Guides Bodybuilding com
  Band_Hip_Adductions: '2S7OgmeCs6E', // Hip exercise - adduction with band
  Barbell_Ab_Rollout: '3C1TRMJveXo', // Barbell Rollout
  'Barbell_Ab_Rollout_-_On_Knees': 'MW8pIlUhkBE', // Barbell Ab Rollout - On Knees Exercise
  Barbell_Curls_Lying_Against_An_Incline: 'F6i5hRfLf2U', // Barbell Curls Lying Against an Incline
  Barbell_Guillotine_Bench_Press: 'g4t9IoHFA0s', // Barbell Guillotine Bench Press
  Barbell_Hack_Squat: '0_FUQNQzma0', // Barbell Hack Squat
  Barbell_Incline_Shoulder_Raise: 'ZcU8twN7EsA', // Barbell Incline Shoulder Raise
  Barbell_Rollout_from_Bench: '6ARApwu9jWY', // Barbell Rollout From Bench
  Barbell_Seated_Calf_Raise: 'J9vXMRGHzaI', // Barbell Seated Calf Raise
  Barbell_Shrug_Behind_The_Back: 'OoUQRw91D94', // How to - Barbell Shrug Behind The Back
  Barbell_Side_Split_Squat: 'Mu7zVot0MmU', // Barbell Side Split Squat 🔥
  Barbell_Walking_Lunge: 'La8YR6wCsEE', // Barbell Walking Lunges tutorial
  Battling_Ropes: 'ZEAqK0lXnb0', // How to Use Battle Ropes #gym #workouttips
  Bear_Crawl_Sled_Drags: 'PpQFyr4IBjw', // Bear Crawl Sled Drags Exercise Videos & Guides Bodybuilding com
  Behind_Head_Chest_Stretch: '1k4gX24VB4U', // behind the head chest stretch
  Bench_Jump: '-23PhtT_b-I', // How To: Bench Jump
  Bench_Sprint: 'wFc-ZrkiSsI', // Tutorial | Bench Sprint
  Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench: 'PQ2JaDQAQVU', // Bent-Over Dumbbell Rear Delt Raise Wtih Head On Bench
  'Bent_Over_Low-Pulley_Side_Lateral': 'vVha5m3ZCMo', // Tutorial | Bent-Over Low Pulley Side Lateral
  'Bent_Over_One-Arm_Long_Bar_Row': '6e-RoYjC6UQ', // How To Do Bent Over One Arm Long Bar Row | Exercise Demo
  'Bent_Over_Two-Arm_Long_Bar_Row': 'O2V58mCnmQc', // How To Do Bent Over Two Arm Long Bar Row | Exercise Demo
  Bent_Press: 'cmVXzpLROGw', // Bent Kettlebell Press Tutorial
  'Bent-Knee_Hip_Raise': 'zAZE1NoSbTk', // Bent knee Hip Raise
  Board_Press: '9c-ymy6mw7w', // Exercise Index: Board Press
  Bodyweight_Flyes: 'DgtzUYla5-k', // Bodyweight flies
  Bodyweight_Mid_Row: '7xMrD4x5WaU', // Bodyweight Mid Row Exercise Demo How-to
  Bodyweight_Walking_Lunge: 's2tC7WhZw2k', // Walking Lunges - Bodyweight
  Bosu_Ball_Cable_Crunch_With_Side_Bends: 'XvLdXW6H1IU', // Bosu Ball Cable Crunch with Side Bends
  'Bottoms-Up_Clean_From_The_Hang_Position': '6NIPWgRiwd4', // Kettlebell Exercises - Bottoms Up Clean From Hang Position
  Box_Jump_Multiple_Response: 'XxLwtzSsO9w', // Box Jumps - Multiple Response
  Box_Skip: 'Fa5MMsEZxDU', // Lateral Box Skip
  'Brachialis-SMR': 'L6TNPiiOvv0', // Brachialis SMR Exercise Videos & Guides Bodybuilding com
  Bradford_Rocky_Presses: 'sArfwQMV6Y0', // How To Do Bradford Rocky Presses | Exercise Demo
  Butt_Lift_Bridge: 'eedJTiasudk', // Butt Lift Bridge - Thighs Exercise
  'Butt-Ups': 'VBSKr9C4xdc', // Butt Up Exercise
  Cable_Hip_Adduction: 'gdXIIVY8wIY', // Cable Hip Adduction
  Cable_Incline_Pushdown: 'O9vty3Grpu8', // Cable Incline Pushdown
  Cable_Internal_Rotation: 's8Ugku3r-10', // Cable Internal Rotation: Exercise Demo How-to
  Cable_Iron_Cross: '7C8ntZTdE9s', // Tutorial | Cable Iron Cross
  Cable_Judo_Flip: 'osrtPt105mE', // Cable Judo Flip Exercise
  Cable_Reverse_Crunch: 'Ss3G7RnIjV4', // Cable Reverse Crunch Exercise
  Cable_Russian_Twists: 'wWf7-j_7OcY', // Cable Russian twists
  Cable_Shrugs: 'xliLyTB6PRg', // Cable shrug tutorial
  Calf_Press: 'dhRz1Ns60Zg', // How To Do Calf Raises On The Leg Press
  Calf_Raise_On_A_Dumbbell: 'ADITZCcUyVo', // DB Calf Raises
  Calf_Stretch_Elbows_Against_Wall: 'hKOegRU3YIs', // Calf Stretch Elbows Against Wall Exercise
  Calf_Stretch_Hands_Against_Wall: 'ZBrzQtEUevw', // calf stretch with hands against wall
  'Calf-Machine_Shoulder_Shrug': 'nck_G2K5SsA', // Shoulder shrug calf machine
  'Calves-SMR': 'kG2tH2DoVfQ', // SMR Calves
  Car_Deadlift: 'HtAvrrobUQk', // How to Car Deadlift (strongman tutorial)
  Carioca_Quick_Step: 'XEw2SLBP-oE', // How To Do Carioca Quick Step | Exercise Demo
  Cat_Stretch: 'GFBuCooCD6Y', // Cat stretch
  Catch_and_Overhead_Throw: 'l8eECoCwmRs', // Catch and Overhead Throw
  Chain_Handle_Extension: 'Ta12euVr2-o', // Chain Handle Extension Exercise Guide and Video
  Chain_Press: '8YYHWMNRhlk', // Chain Press
  Chair_Leg_Extended_Stretch: '8_zQcRf9wEk', // Chair Leg Extended Stretch Exercise Videos & Guides Bodybuilding com
  Chair_Lower_Back_Stretch: 'G8srpkfE9qI', // Chair Stretch for Lower Back - Sunday Stretch
  Chair_Upper_Body_Stretch: 'ymOcpNW6vVY', // Upper Body Stretches: 10 minute workout in a chair
  Chest_And_Front_Of_Shoulder_Stretch: 'ICi4iiAn_n4', // Chest and Shoulder Stretch
  Chest_Push_from_3_point_stance: '9mxn6nliL68', // CHEST PUSH FROM 3 POINT STANCE.
  Chest_Push_multiple_response: 'zkEy0iWYaBY', // Chest Push Multiple Response: Chest, Pec Exercise Demo How-to
  Chest_Push_single_response: '8uEWEYahoXg', // Chest Push Single Response, Tutorial, Exercise Video, Workout, SEXioFIT
  Chest_Push_with_Run_Release: '2bhC4Bg7Ncg', // CHEST PUSH WITH RUN RELEASE.
  Chest_Stretch_on_Stability_Ball: 'OeZE2W4s_Bk', // Chest Stretch Stability Ball
  Childs_Pose: '2vJKSlfLX10', // Childs Pose
  Chin_To_Chest_Stretch: '77XLKpynpiY', // Chin to Chest Stretch
  Circus_Bell: 'vJ42I9I8WSM', // How To Do Circus Bell | Exercise Demo
  Clean: 'Ty14ogq_Vok', // The Clean
  Clean_and_Jerk: 'a4l0wRfGvXE', // How to clean and jerk #workout
  Clean_and_Press: 'KCe8l86-alA', // How To Clean And Press
  Clean_from_Blocks: 'YUfhwMluCrw', // Exercise Tutorials - Clean from blocks
  Clean_Pull: 'ilp8K2qGBAk', // HOW TO Clean Pull | Barbell Method
  Clean_Shrug: 'FLIFCFMyx80', // How To Do Clean Shrug | Exercise Demo
  'Clock_Push-Up': '-59AS5auNIU', // Clock Push Ups arm exercise
  'Close-Grip_EZ_Bar_Curl': 'ifOmt6O_72g', // Close Grip Ez-bar Biceps curl exercise
  'Close-Grip_EZ-Bar_Curl_with_Band': 'mLQutC9ofHw', // Close-Grip EZ Bar Curl With Band
  'Close-Grip_EZ-Bar_Press': 'CGb5uObh0VA', // Close Grip EZ Bar Press
  'Close-Grip_Push-Up_off_of_a_Dumbbell': 'jR65wQWPLs0', // How To Do Close Grip Push Up Off Of A Dumbbell | Exercise Demo
  Cocoons: '01AjkjoqH6Y', // cocoons exercise
  Conans_Wheel: 'oEsyO1PVDNY', // How to Conan’s Wheel (Strongman Tutorial)
  Cross_Body_Hammer_Curl: 'm53z1mBYhTc', // Cross Body Hammer Curls
  'Cross_Over_-_With_Bands': 'Cu3KTlYE6rE', // CROSS OVER WITH RESISTANCE BAND
  'Cross-Body_Crunch': 'ebeoMxrfBck', // Cross Body Crunch
  Crossover_Reverse_Lunge: 'TZ5nRBHNeG0', // Reverse Crossover Lunge
  'Crunch_-_Hands_Overhead': 'pdJrNanEQJw', // Crunch with Hands Overhead
  'Crunch_-_Legs_On_Exercise_Ball': 'meo3bhh8NPk', // Crunch - Legs On Exercise Ball Exercise
  Cuban_Press: 'a7k5HWJqrDY', // Exercise Demonstration: The Cuban Press
  Dead_Bug: 'HrxOWhPdsOY', // Dead bug core exercise
  'Decline_Close-Grip_Bench_To_Skull_Crusher': 'aDpFEljzQMM', // How To Do Decline Close Grip Bench To Skull Crusher
  Decline_Crunch: 'D_6tXVmq_nM', // How to do decline crunches correctly? #shorts
  Decline_EZ_Bar_Triceps_Extension: 'cVNT5fP26TE', // How to do a Decline EZ Bar Triceps Extension
  Decline_Oblique_Crunch: 'DQ6QuvPll8U', // Decline Oblique Crunch - Abs Exercise
  Decline_Reverse_Crunch: 'llBeKBs21Q8', // How to: Decline Reverse Crunch
  Depth_Jump_Leap: 'fdjhvvJ12Js', // Depth Jump Leap, Tutorial, Exercise Video, Workout, SEXioFIT
  Dip_Machine: '17pNnaProa8', // How to Train Triceps ( Dip Machine)
  Double_Kettlebell_Alternating_Hang_Clean: 'JX64eQ4Ffq4', // Double Kettlebell Alternating Hang Clean
  Double_Kettlebell_Jerk: '8o57QuLWkkk', // How To Do The Double Kettlebell Jerk
  Double_Kettlebell_Push_Press: '33xXpirKUOo', // Double Kettlebell Push Press
  Double_Kettlebell_Snatch: 'p7Evs2D5aZc', // How to do a Double Kettlebell Snatch
  Double_Kettlebell_Windmill: 'ozqn_iCMpdo', // How to advance you Double kettlebell Windmill
  Double_Leg_Butt_Kick: '1CiN0VNTReE', // Double Leg Butt Kick
  Downward_Facing_Balance: 'PRja65swvic', // Downward Facing Balance Exercise Videos & Guides
  Drag_Curl: '5PdEraHkF1A', // Dumbbell Drag Curl
  Drop_Push: '2GCx-FeIpaY', // Drop Push Up
  Dumbbell_Clean: '5ltUTOMGN5w', // Dumbbell Clean
  Dumbbell_Floor_Press: 'uUGDRwge4F8', // How To: Dumbbell Floor Press
  Dumbbell_Incline_Shoulder_Raise: 's2nZRuZvByQ', // Dumbbell Incline Shoulder Raise
  'Dumbbell_Lying_One-Arm_Rear_Lateral_Raise': 'rVEqd3IzrPM', // dumbbell lying one arm rear lateral raise
  Dumbbell_Lying_Pronation: 'M_pkj9o2cnM', // Dumbbell Lying Pronation
  Dumbbell_Lying_Rear_Lateral_Raise: 'UtFvLv9sDfY', // How To Do Dumbbell Lying Rear Lateral Raise | Exercise Demo
  Dumbbell_Lying_Supination: 'STPrYroEy1g', // Dumbbell Lying Supination
  Dumbbell_Prone_Incline_Curl: 'sPvKZvWODJk', // Prone Incline Dumbbell Curl
  Dumbbell_Raise: 'XPPfnSEATJA', // How to do a Dumbbell Lateral Raise
  Dumbbell_Scaption: 'fLKMEKqCbCk', // How To Do a Dumbbell Scaption Raise
  Dumbbell_Seated_Box_Jump: '4XPbKK3F_IA', // DB Seated Box Jump | PerformHQ
  'Dumbbell_Seated_One-Leg_Calf_Raise': 'gTVO3AT7SVs', // Dumbbell Seated One Leg Calf Raise Exercise Videos & Guides Bodybuilding com
  Dumbbell_Side_Bend: 'mjRUPpMh988', // Dumbbell Side Bend
  Dumbbell_Step_Ups: 'btF_rOOyWX8', // How to do Dumbbell Step Ups!
  Dynamic_Back_Stretch: 'iWhJw5UQu48', // Dynamic Back Stretch
  Dynamic_Chest_Stretch: 'm8kAuDra_N8', // Dynamic Chest Stretch
  Elbow_Circles: 'EHQfX-ySVWg', // Elbow Circles
  Elbow_to_Knee: 'v_tM1pppjSU', // How To: Alternating Knee To Elbow Crunches
  Elbows_Back: 'rhtadqkrWo0', // How to Do：ELBOWS BACK
  Elevated_Back_Lunge: '9JmyJymidWg', // Barbell Back Rack Front Foot Elevated Reverse Lunge
  Elliptical_Trainer: 'TplMLlBZ1zc', // how you can get on the elliptical cross trainer #cardio #gymexercise #viralshort #viralfeeds
  Exercise_Ball_Crunch: 'EwPxoYbrltk', // Exercise Ball Crunch
  'Exercise_Ball_Pull-In': 'ZvSwTGgETIo', // Exercise Ball Pull-in
  'Extended_Range_One-Arm_Kettlebell_Floor_Press': 'p_pf8S5vpTU', // Extended Range One Arm Kettlebell Floor Press - How To
  External_Rotation_with_Band: '4n_9LOjplOE', // Band External Rotation
  'EZ-Bar_Skullcrusher': 'ixRe5dMiGmM', // Exercise Index: EZ Bar Skullcrusher
  Farmers_Walk: 'Hvwv2uliIqc', // How To Perform A Farmers Walk
  Fast_Skipping: 'Xc7gFBIUvwA', // Skipping (without rope)
  Finger_Curls: 'gnDRXH2J5Yc', // How To Perform Finger Curls Tutorial
  'Flat_Bench_Leg_Pull-In': 'noh8Zl5Nt7c', // Flat Bench Leg Pull In
  Flexor_Incline_Dumbbell_Curls: 'DVRe2vqQLfA', // BICEPS EXERCISE FLEXOR INCLINE DUMBBELL CURLS
  'Floor_Glute-Ham_Raise': 'C4qzlZS7tHc', // Floor Glute/Ham Raise
  Floor_Press_with_Chains: 'qfjk6OWdlMA', // Floor Press with Chains
  Flutter_Kicks: 'K5wuM_gNWyw', // How to Do: FLUTTER KICKS
  'Foot-SMR': 'gC3Plw6cbTI', // How to (SMR) Foot Release
  Forward_Drag_with_Press: 'u3RZXe1kqLA', // Forward Drag with Press Exercise Videos & Guides Bodybuilding com
  Frankenstein_Squat: 'P7rSqw4MO4w', // How to: Frankenstein Squat
  Freehand_Jump_Squat: '3hma-OqsiLw', // Freehand Jump Squat
  Frog_Hops: 'dSnEDERVfvY', // Frog Hops
  'Frog_Sit-Ups': 'TLJbFKgkonQ', // Frog Sit Ups
  Front_Box_Jump: 'bQyXdtPyBJA', // Front Box Jump
  Front_Cone_Hops_or_hurdle_hops: 'FXb-dUkGL5o', // Front Cone Hops Or Hurdle Hops, Tutorial, Exercise Video, Workout, SEXioFIT
  Front_Leg_Raises: 'UIJoMa5mXWY', // Front Leg Raises
  Front_Raise_And_Pullover: 'yKXreRgjdwk', // front raise pullover
  Gironda_Sternum_Chins: 'XzcKNaogLeM', // Gironda Sternum Chins
  Good_Morning_off_Pins: 'FubluSoLsmk', // Good Mornings Off Pins
  Gorilla_Chin_Crunch: '4cXIO4_HGsw', // Gorilla Chin Crunch Exercise
  Groin_and_Back_Stretch: 'lcEa1HJ81y0', // Quadruped Rock Back - hip adductor stretch exercise for groin and inner thigh flexibility
  Groiners: 'vRH5wywUefI', // How To Do Groiners - Mobility Exercises
  Hamstring_Stretch: 'Q4_TmIekeZ8', // Hamstring Stretch
  'Hamstring-SMR': 'wQ6uUuBWCbw', // SMR Hamstring
  'Handstand_Push-Ups': 'qbRbM6d5ddM', // Handstand Push-Up Variations
  Hang_Clean: 'frSZNeT0FIk', // Movement Demo - The Hang Clean
  'Hang_Clean_-_Below_the_Knees': 'O7cHat2UFyY', // Below The Knee Hang Clean
  Hang_Snatch: 'IucshEToDyM', // The Hang Snatch
  'Hang_Snatch_-_Below_Knees': 'OE3haqtWJpo', // Hang Snatch Below Knee
  Hanging_Bar_Good_Morning: 'wp4lOBIKQh4', // Hanging Bar Good Morning Exercise Videos & Guides Bodybuilding com
  Hanging_Leg_Raise: 'hGTni2P_vZg', // How to do Hanging Leg Raises!
  Hanging_Pike: 'Xy9bW-V36ys', // Hanging Pike Raises
  Heaving_Snatch_Balance: 'VCYa3N9Qb4o', // Heaving Snatch Balance
  High_Cable_Curls: 'gTl4SVnkYU4', // High Cable Curls: Exercise Demo How-to
  Hip_Circles_prone: 'c9qsW_OnpTc', // Prone Hip Circles
  Hip_Extension_with_Bands: 'ogFC7XVkYuY', // Hip exercise - hip extension with band
  Hip_Flexion_with_Band: 'ck6AO1viZSs', // Band Hip Flexion
  Hip_Lift_with_Band: 'amJp4BIwtHo', // Banded hip lift
  Hug_A_Ball: 'pu7nL99drSY', // Ball Hug
  Hug_Knees_To_Chest: 'eYKsxsfcq1s', // Hug Knees To Chest Exercise Guide and Video.mp4
  Hurdle_Hops: 'efsCHtj7t_U', // Hurdle Hops Exercise Videos & Guides Bodybuilding com
  'Iliotibial_Tract-SMR': 'Ncl0oa4pD-8', // Iliotibial tract-SMR / IT Band Foam Rolling: Stretching Exercise Demo How-to
  Inchworm: '-q1XGQ2VMUU', // Inchworm Exercise
  Incline_Barbell_Triceps_Extension: 'Uc5a-SxWPWQ', // Incline Barbell Triceps Extension | How to perform
  Incline_Bench_Pull: '50vRvFaTQvg', // Incline Bench Pull
  Incline_Cable_Flye: 'HJmQQuJ-MQ8', // How to incline cable chest fly
  Incline_Dumbbell_Bench_With_Palms_Facing_In: 'SQF1eEo6phU', // Incline Dumbbell Bench Press Palms Facing In
  'Incline_Push-Up_Close-Grip': '_kIqUhEYv5M', // Close Grip Incline Push-Ups
  'Incline_Push-Up_Depth_Jump': '9wmYEN1FtfM', // How To Do : INCLINE PUSH UP DEPTH JUMP | CHEST WORKOUT
  'Incline_Push-Up_Reverse_Grip': 'MTaFzrhT7gQ', // Reverse Grip Incline Push Ups
  Intermediate_Groin_Stretch: '4xOP3JM23ro', // How to do a groin stretch.
  Intermediate_Hip_Flexor_and_Quad_Stretch: '-BdqNu83nMQ', // Intermediate Hip Flexor and Quad Stretch Exercise Videos & Guides Bodybuilding com
  Internal_Rotation_with_Band: '5n10NSwfp2U', // Shoulder Internal Rotation with Band
  Inverted_Row: 'EfE7JeD8o6Y', // How to do an Inverted Row
  Inverted_Row_with_Straps: '2Zsso20AyD8', // Inverted Row with Straps Exercise Videos & Guides Bodybuilding com
  Iron_Crosses_stretch: 'sxL2c66cP7w', // Iron Crosses stretch Exercise Videos & Guides Bodybuilding com
  Isometric_Chest_Squeezes: 'anxpxp0rbHs', // Isometric Chest Squeeze
  'Isometric_Neck_Exercise_-_Front_And_Back': 'PSwHo-kcfhc', // How to - Isometric Neck Exercise (Front and Back)
  'Isometric_Neck_Exercise_-_Sides': 'dSwNfqs8NjY', // Isometric Neck Exercise - Sides
  Isometric_Wipers: 'RawV50M0mzs', // How to do isometric wipers chest exercise
  IT_Band_and_Glute_Stretch: 'uXMyxNqUUMM', // The Best Stretches for Your Glutes & IT Band
  Jerk_Balance: '-xv-LqZCRWk', // Jerk Balance
  Jerk_Dip_Squat: 'VTr-mFr8Pgo', // Jerk Dip Squat
  JM_Press: '1v_WtGNauOQ', // JM Press (tricep exercise)
  Jogging_Treadmill: 'UIyZUHq2UdU', // How to run on a treadmill (improve your gait)
  Keg_Load: 'aTbGyyAAfmM', // Keg Load Technique and Variations
  Kettlebell_Arnold_Press: 'ohrteMlznss', // Kettlebell Arnold Press: How to Do It
  Kettlebell_Dead_Clean: 'WFnnHBpvttE', // Kettlebell Dead Clean
  Kettlebell_Figure_8: 'hIOKFXBv11E', // KETTLEBELL EXERCISES - FIGURE 8 HOOKS
  Kettlebell_Hang_Clean: 'Z8zvgkiFmNQ', // Kettlebell Hang Clean
  'Kettlebell_One-Legged_Deadlift': '77QZkTrVSNY', // Kettlebell Single-Leg Deadlift
  Kettlebell_Pass_Between_The_Legs: 'dPqGBoegbj8', // Kettlebell Pass Between The Legs Exercise
  Kettlebell_Pirate_Ships: 'eGv_qYDyJTM', // How To Do Kettlebell Pirate Ships | Exercise Demo
  Kettlebell_Pistol_Squat: 'aEJ3rOEoqZ0', // How To Pistol Squat with a Kettlebell
  Kettlebell_Seated_Press: 'Lx9afObvORE', // KETTLEBELL SEATED PRESS TUTORIAL
  Kettlebell_Seesaw_Press: 'mZ9hxnddbWc', // Seesaw Press Form | Kettlebell Exercises
  Kettlebell_Sumo_High_Pull: 'o9PWq8JrNdM', // Kettlebell Sumo Deadlift High-Pull Exercise Demonstration
  Kettlebell_Thruster: '7T_CYFLjSb8', // KETTLEBELL THRUSTER - EXERCISE LIBRARY
  'Kettlebell_Turkish_Get-Up_Lunge_style': '6TwOsyh3TWg', // Kettlebell Turkish Get Up Lunge style Exercise Videos & Guides Bodybuilding com
  'Kettlebell_Turkish_Get-Up_Squat_style': 'ApoAgK2MGgM', // How To Do Kettlebell Turkish Get Up Squat Style | Exercise Demo
  Kettlebell_Windmill: 'v2bQSl57z2o', // How to do a Kettlebell Windmill #coreexercise
  Kipping_Muscle_Up: 'ZtONmh5a_fU', // KIPPING MUSCLE-UP
  Knee_Across_The_Body: '9-z7lh6RHAo', // KNEE ACROSS BODY
  Knee_Circles: 'E3GeFyXlOwI', // How To Do Knee Circles
  Knee_Hip_Raise_On_Parallel_Bars: '2QLm7eVRtbM', // Knee/Hip Raise On Parallel Bars
  Knee_Tuck_Jump: 'XP2hUrRjTcw', // Knee Tuck Jump Demo
  Kneeling_Arm_Drill: '-cqC7XFYIpk', // Kneeling Arm Drill
  Kneeling_Cable_Crunch_With_Alternating_Oblique_Twists: '9zWWTq4YtmI', // Kneeling Cable Crunch with Alternating Oblique Twists
  Kneeling_Forearm_Stretch: 'zyyoppwrgo0', // Kneeling Forearm Stretch
  Kneeling_High_Pulley_Row: 'uBJ_sRF9ItI', // How to do Kneeling High Pulley Row Exercise
  Kneeling_Hip_Flexor: '4a9lLFNbEGE', // kneeling hip flexor stretch
  Kneeling_Jump_Squat: '5mc6FkYq2ls', // Kneeling Squat Jump
  'Kneeling_Single-Arm_High_Pulley_Row': 'EKYy9PvuHuQ', // Kneeling Single Arm High Pulley Row - Back Exercise
  Kneeling_Squat: 'GBH5KnZi6xQ', // Kneeling Squat - How To Do The Kneeling Squat
  Landmine_180s: 'EeruocCrJCw', // How to do landmine 180
  Landmine_Linear_Jammer: 'NOrpEdNoOVQ', // How To Do Landmine Linear Jammer | Exercise Demo
  Lateral_Bound: 'soqQy4dzEts', // How To Lateral Bound
  Lateral_Box_Jump: 'AImxPzoDKnU', // Exercise Index: Lateral Box Jump
  Lateral_Cone_Hops: 'hYiP9OT8VoI', // Lateral Cone Hops
  'Latissimus_Dorsi-SMR': 'gslnKB-iJas', // SMR - Latissimus Dorsi
  Leg_Lift: 'oV99_zvhl_A', // Straight Leg Lift Exercise
  'Leg_Pull-In': 'DXkm0SxnNpE', // How To Do: Leg Pull In
  'Leg-Over_Floor_Press': 'rK6_eLYosrA', // Leg Over Kettlebell Floor Press
  'Leg-Up_Hamstring_Stretch': 'qQ26F282VRo', // Standing hamstring stretch with leg elevated - Fit Family Physical Therapy
  Leverage_Deadlift: 'rX4v2dTlRIE', // Leverage Deadlift Exercise Videos & Guides Bodybuilding com
  Leverage_High_Row: 'dmQM2gqHw6o', // Nautilus Leverage High Row
  'Linear_3-Part_Start_Technique': 'aFL0MD2gu7w', // Linear 3 Part Start Technique Exercise Videos & Guides Bodybuilding com
  Linear_Acceleration_Wall_Drill: 'eeqZSZlpDi8', // LINEAR SPEED + ACCELERATION WALL DRILL
  Linear_Depth_Jump: 'QXINHVEx9-Y', // Plyometrics / linear depth jump
  Log_Lift: 'OVKyxUu5zcc', // Log Lift
  London_Bridges: 'MeIOoXQQU-4', // Exercises: London Bridge
  Looking_At_Ceiling: 'kyaJRK7ui_M', // Looking At Ceiling Exercise Videos & Guides Bodybuilding com
  Lower_Back_Curl: 'K7iBRciXigs', // How To Do Lower Back Curl | Exercise Demo
  'Lower_Back-SMR': 'W0UT-PXNjF0', // How To Do Lower Back SMR | Exercise Demo
  Lunge_Pass_Through: 'qIHTfUXLjY4', // Lunge pass through
  Lunge_Sprint: 'zIEjl1F_rPo', // How To Do Lunge Exercise Correctly To Sprint Faster
  Lying_Bent_Leg_Groin: 'agP60k0FcVE', // Straight Leg Banded Groin Stretch-band assisted adductor stretch
  Lying_Cable_Curl: '-QU3155mhTk', // How to do Lying Cable Curls
  Lying_Cambered_Barbell_Row: 'j6dyz8QyOww', // Lying Cambered Barbell Row
  'Lying_Close-Grip_Bar_Curl_On_High_Pulley': '76_uuVdMN10', // Lying Close Grip Bar Curl On High Pulley Exercise Videos & Guides Bodybuilding com
  'Lying_Close-Grip_Barbell_Triceps_Extension_Behind_The_Head': 'XPQziBbJVnI', // Lying Close-Grip Barbell Triceps Extension Behind The Head
  'Lying_Close-Grip_Barbell_Triceps_Press_To_Chin': 'mauSRcRf7-g', // How To Do Lying Close Grip Barbell Triceps Press To Chin | Exercise Demo
  Lying_Crossover: 'Rli7E_qw6F4', // Lying Crossover Stretch
  Lying_Face_Down_Plate_Neck_Resistance: 'pBHatm9Ex6w', // How To: Lying Face Down Plate Neck Resistance
  Lying_Face_Up_Plate_Neck_Resistance: 'FEhWKplAe1U', // How To: Lying Face Up Plate Neck Resistance
  Lying_Glute: 'VF36mdhlX7A', // Side Lying Glute Activation Drill
  Lying_Hamstring: '5P3E8Pec_L8', // How To Do Lying Hamstring Stretch
  Lying_High_Bench_Barbell_Curl: 'bqkiaMKtdSU', // BICEPS EXERCISE LYING HIGH BENCH BARBELL CURL
  Lying_Machine_Squat: 'guW4ClrFbSM', // Lying machine squat
  'Lying_One-Arm_Lateral_Raise': 'rVEqd3IzrPM', // dumbbell lying one arm rear lateral raise
  Lying_Prone_Quadriceps: 'nd4CYtu0a1M', // Prone lying quadriceps muscle stretch L
  Lying_Rear_Delt_Raise: 'X7acAeEyBXM', // dumbbell side lying rear delt raise
  Lying_Supine_Dumbbell_Curl: 'n3MXFaGzg5U', // Lying Supine Dumbbell Curl
  Medicine_Ball_Chest_Pass: 'HEnF3GMIOQ4', // Medicine Ball Chest Pass Exercise
  Medicine_Ball_Full_Twist: 'ii0cX8FfigY', // Medicine Ball Full Twist Exercise Videos & Guides Bodybuilding com
  Medicine_Ball_Scoop_Throw: 'KuFp5h7Ts2M', // Medicine Ball Scoop Toss
  Middle_Back_Shrug: '91-CcFKUxwQ', // Middle Back Shrug
  Middle_Back_Stretch: 'JrNcpg6QbDM', // Mid Back Stretches To Do At Home!!
  Mixed_Grip_Chin: '5yjvkfRBwNA', // Mixed Grip Chin Up | PerformHQ
  Monster_Walk: 'snbNxUIUQPc', // Monster Walk Exercise Demonstration
  Mountain_Climbers: 'hZb6jTbCLeE', // How to Do Mountain Climbers - Fitness Fridays #shorts
  Moving_Claw_Series: 'd6M3mfAt90E', // Moving Claw Series Exercise Videos & Guides Bodybuilding com
  Muscle_Snatch: 'LRcTB2-Xyg8', // The Muscle Snatch
  Narrow_Stance_Squats: '4mOdVjCxdj4', // Narrow Stance Squats
  Natural_Glute_Ham_Raise: 'u4lxc1nPv-w', // Natural Glute Ham Raises
  Neck_Press: 'zgyer29nqx4', // How to Behind the Neck Press
  'Neck-SMR': 'zgMU8TTJGfM', // SMR - Neck
  'Oblique_Crunches_-_On_The_Floor': 'WSkC6KZLzjU', // Oblique crunches on the floor
  On_Your_Side_Quad_Stretch: 'ZgbtIZ9uEiE', // Side Lying Quad Stretch
  'On-Your-Back_Quad_Stretch': '_KaeShrjE5M', // Active Quad Stretches - Get knee and back pain relief
  One_Arm_Against_Wall: 'ncGj3Tb-q50', // One arm Biceps stretch against wall
  'One_Arm_Chin-Up': 'nPjfLXui4Zw', // One Arm Chin Up Exercise. Best for Linear Progression
  One_Arm_Floor_Press: 'aE-DSGffdAE', // Prez Performance - How To One-Arm Dumbbell Floor Press
  One_Half_Locust: 'okaXWU_VAEw', // One Half Locust Exercise Videos & Guides Bodybuilding com
  One_Handed_Hang: 'd-v2ds4_WFU', // One hand hang Exercise
  One_Knee_To_Chest: 'RJlykGcn5bo', // Single Knee to Chest Exercise
  'One-Arm_Flat_Bench_Dumbbell_Flye': 'Bd2WnpZXwyI', // One-Arm Flat Bench Dumbbell Flye
  'One-Arm_High-Pulley_Cable_Side_Bends': 'j95o6qAbpGs', // One Arm High Pulley Cable Side Bends - Abs Exercise
  'One-Arm_Kettlebell_Clean': 'TP9t70Nx9xU', // One Arm Kettlebell Clean
  'One-Arm_Kettlebell_Clean_and_Jerk': 'ZfBWEPmr5ZE', // One Arm Kettlebell Clean and Jerk Exercise Videos & Guides Bodybuilding com
  'One-Arm_Kettlebell_Floor_Press': 'eWBEUFUQq94', // One Arm Kettlebell Floor Press (Exercises.com.au)
  'One-Arm_Kettlebell_Jerk': '_XBgegWiKl0', // How To Do One Arm Kettlebell Jerk | Exercise Demo
  'One-Arm_Kettlebell_Military_Press_To_The_Side': 'WSFbflKxbbQ', // One Arm Kettlebell Military Press To The Side Exercise Videos & Guides Bodybuilding com
  'One-Arm_Kettlebell_Para_Press': 'skjHmTDtNVY', // How to: One Arm Kettlebell Clean & Press
  'One-Arm_Kettlebell_Push_Press': 'JYk7okndWFQ', // Kettlebell Single Arm Push Press
  'One-Arm_Kettlebell_Row': 'l5qelXL5nfs', // Single Arm Kettlebell Row
  'One-Arm_Kettlebell_Snatch': '3rFbWLHZe_Q', // HOW TO: Single Arm Kettlebell Snatch
  'One-Arm_Kettlebell_Split_Jerk': 'boJdXRtiEAQ', // One Arm Kettlebell Split Jerk Exercise Videos & Guides Bodybuilding com
  'One-Arm_Kettlebell_Split_Snatch': 'Fv3A5RM0J5E', // One-Arm Kettlebell Split Snatch
  'One-Arm_Kettlebell_Swings': 'fle6WA6X0IE', // One Arm Kettlebell Swing
  'One-Arm_Long_Bar_Row': 'pbsDOkeECR8', // ONE ARM LONG BAR ROW
  'One-Arm_Medicine_Ball_Slam': 'fJQ7kFFhaaY', // BB.coms How to One Arm Medicine Ball Slam
  'One-Arm_Open_Palm_Kettlebell_Clean': 'cEexU0qT28U', // One Arm Open Palm Kettlebell Clean Exercise Videos & Guides Bodybuilding com
  'One-Arm_Overhead_Kettlebell_Squats': 'al0fcJzlSrc', // Performance Care - Tips for One Arm Overhead Squats
  'One-Arm_Side_Deadlift': 'c3LNPuQmnr0', // One Arm Side Deadlift
  'One-Arm_Side_Laterals': 'DqpedykCnjc', // ONE ARM SIDE LATERALS
  Open_Palm_Kettlebell_Clean: 'OqO3-J0nwaU', // Kettlebell Open Palm Clean
  'Otis-Up': '2use4VrurJo', // How To: Weighted Otis Up
  Overhead_Cable_Curl: 'zwBRxWpGeZE', // Cable Overhead Curl
  Overhead_Lat: 'xUsETzmcYs4', // Overhead lat stretch
  Overhead_Slam: 'a7ZnLpLIb8s', // Overhead Med-Ball Slam
  Overhead_Stretch: 'QYezrlpg3L8', // Overhead Stretch
  Pallof_Press_With_Rotation: 'iAWKyMczcrs', // Pallof Press with Rotation
  'Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench': 'jtQslxR3f0A', // Palms-Down Dumbbell Wrist Curl Over a Bench
  'Palms-Down_Wrist_Curl_Over_A_Bench': 'RNsOqgVInvg', // Palms-Down Wrist Curl Over A Bench
  'Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench': 'VqN3IEJJ33A', // Palms-Up Dumbbell Wrist Curl Over a Bench
  Pelvic_Tilt_Into_Bridge: 'oje869YCAL4', // How to Do a Pelvic Tilt into Bridge | Back Workout
  Peroneals_Stretch: 'b7bTCrhJ34I', // Peroneal stretch
  'Peroneals-SMR': 'b4Qgi5BoIHU', // SMR peroneals
  Pin_Presses: 'A9cURRmXcmw', // Pin Press
  'Piriformis-SMR': 'dq-HAR-FBOw', // PIRIFORMIS (SMR)
  Plate_Pinch: '_cdWkwQGffU', // How to - Plate Pinch
  Plate_Twist: '5m5z6ZZhz04', // Plate Twist
  Platform_Hamstring_Slides: 'EmChfuvQnC0', // Platform Hamstring Slides Exercise Videos & Guides Bodybuilding com
  Plie_Dumbbell_Squat: 'WKVDHusACOM', // Dumbbell Plié Squats
  Plyo_Kettlebell_Pushups: 'mh8x6XK6b_8', // Kettlebell Plyo-Pushup
  'Plyo_Push-up': 'GqfmHyeoLIE', // Plyo Push-ups
  Posterior_Tibialis_Stretch: 'iqKrgussWPk', // Tibialis posterior stretch
  Power_Clean: 'KwYJTpQ_x5A', // The Power Clean
  Power_Clean_from_Blocks: 'Mg7S4hKl5Uo', // Power Clean From Blocks
  Power_Jerk: 'G3E6Fgvc6II', // Power jerk exercise
  Power_Partials: 'B79-mLozX-Y', // How to do Power Partials!
  Power_Snatch: 'a_uQXwXRrCc', // How to perform the power snatch
  Power_Snatch_from_Blocks: 'JE7CTkUhoTY', // Power Snatch From Blocks
  Power_Stairs: 'zqT0YobIiE0', // Power Stairs Exercise Videos & Guides Bodybuilding com
  'Press_Sit-Up': 'Eox8N8cUlXo', // sit up + press
  Prone_Manual_Hamstring: 'Mfmr1J7Fza0', // Prone Manual Hamstring Curl
  Prowler_Sprint: 'auNHA-EakIo', // HOW TO: Prowler Sprint
  Pull_Through: 'IU-ERkjTKXA', // How to properly perform cable pull through
  Push_Press: 'iaBVSJm78ko', // The Push Press
  'Push_Press_-_Behind_the_Neck': 'qh-5-DfDG4E', // How To Behind Neck Push Press
  Push_Up_to_Side_Plank: 'pJUY83BsReY', // How to do Push-Up To Side Plank | Joanna Soh
  'Push-Ups_With_Feet_Elevated': 'xoX1nSewXgA', // How To Do A Feet Elevated Push Up
  'Push-Ups_With_Feet_On_An_Exercise_Ball': 'QM2seN_Nous', // Feet on Swiss Ball Push Up - Shoulder stability exercise
  Pushups_Close_and_Wide_Hand_Positions: 'skWcxqxh2qw', // Wide Pushups
  Pyramid: 'XzWP6YyYaH0', // How To Do Forward Pyramid
  Quad_Stretch: 'Rt45IWGdSuk', // Standing Quad Stretch
  'Quadriceps-SMR': 'rgnHvkypgRQ', // SMR - quadriceps
  Quick_Leap: '7IUw1ukWbxU', // Quick Leap Exercise Videos & Guides Bodybuilding com
  Rack_Delivery: 'WxjRfBe4Uv0', // How To Do Rack Delivery | Exercise Demo
  Rack_Pull_with_Bands: 'um2aIGPW4Pw', // Sumo Rack Pull with Bands
  Rack_Pulls: 'iBX3CV3jYMY', // Rack Pulls
  Rear_Leg_Raises: 'Z8qd8eppuYU', // Rear Leg Raises
  Recumbent_Bike: 'YM4407DzDGk', // "How To" Recumbent Bike
  Return_Push_from_Stance: 'O47WuqYfTss', // Return Push from Stance Exercise Videos & Guides Bodybuilding com
  Reverse_Band_Box_Squat: 'Dh0V-hfztb0', // Reverse Band Box Squat
  Reverse_Band_Deadlift: 'UySx9m9TrNI', // Reverse Band Deadlift
  Reverse_Band_Power_Squat: 'iaAY-W1tqZ8', // Reverse Band Power Squat
  Reverse_Band_Sumo_Deadlift: 'acX29CDZrgo', // Reverse Band Technique Sumo Deadlifts
  Reverse_Crunch: 'XY8KzdDcMFg', // How To Do A Reverse Crunch
  Reverse_Flyes_With_External_Rotation: 'h6INCeFDefU', // Reverse Fly with External Rotation
  Reverse_Plate_Curls: 'w9dhhNJ1wLA', // How To Do Reverse Plate Curls | Exercise Demo
  Reverse_Triceps_Bench_Press: 'HiaUbuwQlTE', // How to do Reverse Grip Barbell Bench Press for Triceps?
  'Rhomboids-SMR': 'kC73OYqsSX8', // How To Do Rhomboids SMR | Self-Myofascial Release
  Rickshaw_Carry: 'pRkHLluG-V8', // Rickshaw Carry
  Rickshaw_Deadlift: '2d2wXoOsq4k', // Rickshaw Deadlift Exercise Videos & Guides Bodybuilding com
  Ring_Dips: '-pChKm_jMYY', // How to do Ring Dips the right way!
  Rocket_Jump: 'soQzE7lxyt0', // Rocket Jumps
  Rocking_Standing_Calf_Raise: 'W-aL8l1BGxU', // Rocking Standing Calf Raise
  'Rocky_Pull-Ups_Pulldowns': 'ozDV_q4FBts', // Rocky Pull-Ups/Pulldowns
  Rope_Climb: 'V3fs-Uq72ek', // 3 ROPE CLIMB TECHNIQUES
  Rope_Jumping: 'ezqHULlVEMo', // How Jumping Rope Changes the Human Body.
  Round_The_World_Shoulder_Stretch: 'ma7NmVGJMTI', // Barbell Round The World Shoulder Stretch
  Rowing_Stationary: 'bCxq4zMHpzs', // How to Use a Rowing Machine for Beginners (cardio) #shorts
  Running_Treadmill: 'UIyZUHq2UdU', // How to run on a treadmill (improve your gait)
  Sandbag_Load: '8Z5KRkwu7-w', // Sandbag load
  Scissor_Kick: 'KLb8vSzaZa4', // Scissor kick exercise
  Scissors_Jump: '0JdQaT69gRo', // Scissor Jumps - Exercise Demo
  Seated_Band_Hamstring_Curl: 'RVS667ybHEM', // Seated hamstring curls with band
  Seated_Barbell_Twist: 'e_DXrXKkd-w', // Seated Barbell Twist - Abs Exercise
  'Seated_Bent-Over_One-Arm_Dumbbell_Triceps_Extension': 'vFvjmP56QZ8', // How To Do Seated Bent Over One Arm Dumbbell Triceps Extension | Exercise Demo
  'Seated_Bent-Over_Two-Arm_Dumbbell_Triceps_Extension': 'dSdryrEnoSo', // Tutorial | Seated Bent-Over Two-Arm Dumbbell Triceps Extension
  Seated_Biceps: 'FwApweWh6SY', // How to do Seated Bicep Curl!
  Seated_Calf_Stretch: 'GoUQ2FD1Uy8', // Seated calf stretch with strap
  'Seated_Close-Grip_Concentration_Barbell_Curl': 'iynnTu_mPw8', // How To Do Seated Close Grip Concentration Barbell Curl | Exercise Demo
  'Seated_Dumbbell_Palms-Down_Wrist_Curl': '-zIEqgHzH2U', // Tutorial | Seated Palms-Down Dumbbell Wrist Curl
  'Seated_Flat_Bench_Leg_Pull-In': '8P-goVBDmKM', // How to do Seated Flat Bench Leg Pull-In Properly?
  Seated_Floor_Hamstring_Stretch: '-V6sgCjCG28', // Floor Seated Hamstring Stretch
  Seated_Front_Deltoid: 'yoqBYu7-KZI', // Seated Front deltoid stretch
  Seated_Glute: 'T0MxJlfE9HQ', // Seated Glute Squeeze
  Seated_Good_Mornings: 'bruYEZhigKA', // How to - Seated Good Mornings
  Seated_Hamstring: 'u55F2jOzBVI', // How to do a seated hamstring stretch
  Seated_Hamstring_and_Calf_Stretch: 'oS3iRMKvqM8', // Seated hamstring and calf stretch
  Seated_Head_Harness_Neck_Resistance: 'lqCumM-_MXE', // How To: Seated Head Harness Neck Resistance
  Seated_Leg_Tucks: 'UmhwN3ps0j8', // Seated Leg tucks
  'Seated_One-Arm_Dumbbell_Palms-Down_Wrist_Curl': 'FfjD0YriJEM', // Tutorial | Seated One-Arm Palms-Down Dumbbell Wrist Curl
  'Seated_One-Arm_Dumbbell_Palms-Up_Wrist_Curl': 'Q7dTbE4kRUY', // Seated One-Arm Dumbbell Palms-Up Wrist Curl
  Seated_Overhead_Stretch: 'aJBEW7a4ADc', // Seated Overhead Stretch
  'Seated_Palm-Up_Barbell_Wrist_Curl': 'SEEmVn7KEsY', // Seated Palm Up Barbell Wrist Curl
  'Seated_Palms-Down_Barbell_Wrist_Curl': 'mc6a67D9m0A', // Seated Palms Down Barbell Wrist Curl
  'Seated_Two-Arm_Palms-Up_Low-Pulley_Wrist_Curl': 'YcXTlq3E3as', // Seated Two Arm Palms Up Low Pulley Wrist Curl - Forearms Exercise
  Shotgun_Row: '_DiVBAPsk4Y', // Shotgun Row Exercise
  Shoulder_Circles: 'UVU2WfPoZeg', // SHOULDER CIRCLES
  Shoulder_Raise: 'fzNWfpP4Ozg', // How to shoulder raise ✅
  Shoulder_Stretch: 'aIq0fLi8iak', // Shoulder Crossbody Stretch
  Side_Bridge: '7ytbYd4CK3o', // How to Do：SIDE BRIDGES
  'Side_Hop-Sprint': 'xyNyl04a_DA', // Side Hop to Sprint - Rehab 2 Perform
  Side_Jackknife: '58yXyh8h2Io', // Side Jackknife
  Side_Leg_Raises: '3t0rbQKov7s', // Side Leg Raises [ Exercise of the Day ]
  Side_Lying_Groin_Stretch: '4IvU_AJZt0w', // Side Lying Groin Stretch
  Side_Neck_Stretch: '54y0JAT46vE', // Neck Side-Bend Stretch
  Side_Standing_Long_Jump: 'a1xE9t-I1lg', // Side Standing Long Jump Exercise Videos & Guides Bodybuilding com
  Side_to_Side_Box_Shuffle: 'lHtdc-vAE60', // Side to Side Box Shuffle
  Side_To_Side_Chins: 'IzYxQKIxexw', // Side To Side Chins
  Side_Wrist_Pull: 'G0XPmf8qW88', // Exercise Database - Side Wrist Pull
  'Side-Lying_Floor_Stretch': 'DMlSdmsHEeI', // How to Do：SIDE-LYING FLOOR STRETCH
  Single_Dumbbell_Raise: 'yPdoJZ89Xkk', // Dumbbell Front raises (shoulder exercise)
  Single_Leg_Butt_Kick: 'eW6j8aLS3po', // Single-Leg Butt Kick
  'Single_Leg_Push-off': 'MiowUaIoum8', // Single Leg Push Off
  'Single-Arm_Cable_Crossover': '_LQMXZIlrrk', // How To Do Single Arm Cable Crossover | Exercise Demo
  'Single-Arm_Linear_Jammer': 'nVRZe_fXTKc', // Linear Single Arm Jammer
  'Single-Cone_Sprint_Drill': 'tjO2_TNPArM', // Single Cone Sprint Drill Exercise Videos & Guides Bodybuilding com
  'Single-Leg_High_Box_Squat': 'cMA7-t1Sysw', // Single Leg Squat to a high box
  'Single-Leg_Hop_Progression': 'IkkX3PTt180', // Single Leg Hop Progression
  'Single-Leg_Lateral_Hop': 'olN7AubEb7Y', // Single Leg Lateral Hop
  'Single-Leg_Stride_Jump': 'FPL7RKZuvEE', // Single Leg Stride Jumps
  'Sled_Drag_-_Harness': '51pJ-gfhgvI', // MYSYNERGYCOACH: Sled backward harness drag
  Sled_Overhead_Backward_Walk: '1JmngNIOdaA', // Sled Overhead Backward Walk Exercise Videos & Guides Bodybuilding com
  Sled_Overhead_Triceps_Extension: '1QI0tFgBuj4', // How To Do Sled Overhead Triceps Extension | Exercise Demo
  Sled_Push: 'QwscR2BhdEg', // How To Do The Sled Push
  Sled_Reverse_Flye: 'zPeGXoUWpeI', // Exercise Guides Sled Reverse Flye,
  Sled_Row: 'kioxCL1To-A', // How To Do a Sled Row
  Sledgehammer_Swings: 'rbaQGeF5S5c', // SLEDGEHAMMER SWINGS
  Smith_Machine_Behind_the_Back_Shrug: '1njYOS5Avcc', // Behind the Back Smith Machine Shrug Exercise
  Smith_Machine_Hang_Power_Clean: 'YjxK7RppzIM', // Smith Machine Hang Power Clean
  Smith_Machine_Hip_Raise: 'Cl3RxqaLz0g', // Smith Machine Hip Raise
  Smith_Machine_Pistol_Squat: 'PE0RzAQ16X0', // Smith Machine Pistol Squats
  Smith_Machine_Reverse_Calf_Raises: 'tyf3K-CKul0', // Smith Machine Reverse Calf Raise
  'Smith_Single-Leg_Split_Squat': 'RnWZCPJDKrs', // Smith Machine Single Leg Split Squat
  Snatch: 'GhxhiehJcQY', // The Snatch
  Snatch_Balance: 'yKmNnr013nU', // How To Do A Snatch Balance
  Snatch_Deadlift: 'L4imM4g2PT8', // Snatch Deadlift
  Snatch_from_Blocks: '8oTEiHX9YJg', // Muscle Snatch from Blocks
  Snatch_Pull: 'AYK4EFtQDV8', // Snatch Pull
  Snatch_Shrug: 'YDTuaW0mPu0', // Snatch Shrug
  Speed_Band_Overhead_Triceps: 'blWRg-eS5fY', // How To Do Speed Band Overhead Triceps | Exercise Demo
  Spell_Caster: 'q7k_1nigh_Y', // How To Dumbbell Spell Caster
  Spider_Crawl: 'zQ2hUq9Rdgs', // Spider Crawl
  Split_Clean: 'a5CR3Bi2Gc8', // The Split Clean
  Split_Jerk: 'gWzQDCtUi3E', // Barbell Split Jerk Exercise
  Split_Jump: 'nN-fkSOL1ds', // How To Do A Split Jump
  Split_Snatch: 'Vsc79Ww8cWA', // How to Do a Split Snatch by Wodstar
  Squat_Jerk: '-N77VhRuFF0', // How To Squat Jerk - The Ultimate Guide
  Squat_with_Plate_Movers: 'fg6p-vjlQog', // Quadriceps Squat With Plate Movers
  Stairmaster: 'SZU9Rm0sNOo', // HOW TO USE A STAIRMASTER | Beginners Guide
  Standing_Alternating_Dumbbell_Press: 'k3GlGdGFg94', // How To Standing Alternating Dumbbell Press
  Standing_Barbell_Press_Behind_Neck: '9yordcOtqtg', // Standing Behind Neck (Barbell press) shoulder workout 🏋️
  'Standing_Bent-Over_One-Arm_Dumbbell_Triceps_Extension': 'jpsP3D4N4UY', // Tutorial | Standing Bent-Over One-Arm Dumbbell Triceps Extension
  'Standing_Bent-Over_Two-Arm_Dumbbell_Triceps_Extension': 'aIJwZVA-xO8', // How To Do Standing Bent Over Two Arm Dumbbell Triceps Extension | Exercise Demo
  Standing_Biceps_Stretch: 'cSsX0MYoLH4', // Standing Bicep Stretch
  Standing_Bradford_Press: 'b0PuidI8-Cw', // Standing Bradford Press
  Standing_Cable_Lift: 'Q9KVi-jYK7c', // Standing Cable Lift
  Standing_Cable_Wood_Chop: 'ZDt4MCvjMAA', // HOW TO: Cable Wood Chop
  Standing_Dumbbell_Reverse_Curl: 'DrT8iG3G8uk', // How To: Standing Dumbbell Reverse Curl
  'Standing_Dumbbell_Straight-Arm_Front_Delt_Raise_Above_Head': 'mJBsPForXs8', // Standing Dumbbell Straight Arm Front Delt Raise Above Head
  Standing_Elevated_Quad_Stretch: 'Yf-t1WI02kU', // Standing Elevated Quad Stretch Exercise Videos & Guides Bodybuilding com
  Standing_Front_Barbell_Raise_Over_Head: 'Ytffw4cHBh0', // Barbell Standing Front Raise Overhead
  Standing_Gastrocnemius_Calf_Stretch: '_votxMInAHE', // Standing Calf Stretch (Gastrocnemius & Soleus)
  Standing_Hamstring_and_Calf_Stretch: 'SsEyumm_9nU', // MYSYNERGYCOACH: Standing Hamstring and Calf Stretch
  Standing_Hip_Circles: 'GL5GcX5L23M', // Standing Hip Circles
  Standing_Lateral_Stretch: 'ioZ-yomA9UQ', // Standing Lateral Stretch
  Standing_Long_Jump: 'AO57oC3Cw14', // Standing long jump technique
  Standing_Olympic_Plate_Hand_Squeeze: 'VHt78JW-6YU', // Standing Olympic Plate Hand Squeeze
  'Standing_One-Arm_Dumbbell_Curl_Over_Incline_Bench': 'Vc3RzV1RCjA', // Standing One Arm Dumbbell Curl Over Incline Bench
  'Standing_Palm-In_One-Arm_Dumbbell_Press': '7JtwHjwpwqs', // How To Do Standing Palm In One Arm Dumbbell Press | Exercise Demo
  'Standing_Palms-In_Dumbbell_Press': 'tnn85noMjWs', // Standing (Palms-In) Dumbbell Press
  'Standing_Palms-Up_Barbell_Behind_The_Back_Wrist_Curl': 'tWGXXJlzNFM', // Standing Palms Up Barbell Behind the Back Wrist Curl - Forearms Exercise
  Standing_Pelvic_Tilt: 'UFNjTGClc9M', // Standing Pelvic tilt
  Standing_Rope_Crunch: 'C0mgblHrnis', // Standing Oblique Rope Crunch
  Standing_Soleus_And_Achilles_Stretch: 'T-k8nxE8vj0', // Standing Soleus And Achilles Stretch Exercise Videos & Guides Bodybuilding com
  Standing_Toe_Touches: 'OUJD4yjr3I4', // How to Do：STANDING CROSSOVER TOE TOUCHES
  Standing_Towel_Triceps_Extension: 'fpmhCrrnP0M', // How To Do Standing Towel Triceps Extension | Exercise Demo
  'Standing_Two-Arm_Overhead_Throw': 'SutFe2ijymU', // Standing Two Arm Overhead Throw
  Star_Jump: 'VVEO_J1tIXU', // How to Do：STAR JUMPS
  'Step-up_with_Knee_Raise': 'd7fiK-rwL2w', // Step-Up + Knee Raise
  Stiff_Leg_Barbell_Good_Morning: 'ZfOiHxy63q8', // Stiff Leg Good Mornings(barbell)
  Straight_Bar_Bench_Mid_Rows: 'pi_FWJSN28A', // Straight bar bench mid row
  Straight_Raises_on_Incline_Bench: 'UhNzKr6TKEY', // Straight Raises on Incline Bench - Shoulders Exercise
  Stride_Jump_Crossover: 'G3TM7N0PQEY', // Stride Jump Crossover
  Sumo_Deadlift: 'MXwS7Q9fKoU', // How to Do a Sumo Deadlift
  Sumo_Deadlift_with_Bands: 'MXwS7Q9fKoU', // How to Do a Sumo Deadlift
  Sumo_Deadlift_with_Chains: '_i8tq5NihcE', // Movement Demo - The Sumo Deadlift With Chains
  Supine_Chest_Throw: 'Ne99ZGIS8ck', // Supine MB Chest Throw
  'Supine_One-Arm_Overhead_Throw': 'GPmscIDo5gc', // How To Do Supine One Arm Overhead Throw | Exercise Demo
  'Supine_Two-Arm_Overhead_Throw': 'GKs19qrNrPw', // How To Do Supine Two Arm Overhead Throw | Exercise Demo
  'Suspended_Push-Up': 'DfJh5UspR_4', // Suspended Push Ups | Suspension Training Exercises
  Suspended_Reverse_Crunch: '27OHZzOGOOE', // SUSPENDED REVERSE CRUNCH
  Suspended_Row: 'NIOpl0Q90uY', // Suspended Row
  The_Straddle: 'uKg1rqo9YrE', // Seated Straddle Stretch
  Tire_Flip: 'P6Ru5uQNS5w', // Exercise of the week: Tire Flip
  Torso_Rotation: 'jHVwgOEA_gU', // Standing Torso Rotation
  Trail_Running_Walking: 'dPJMpizY4JY', // Trail running or walking?
  Trap_Bar_Deadlift: '0yKYXqu83-k', // Explosive trap bar deadlift
  Tricep_Side_Stretch: 'hrS6QLSrNoo', // Triceps Side Stretch
  Triceps_Stretch: 'Uvk1Y8O1_yM', // Tricep Stretch
  Tuck_Crunch: 'uAVwnCOuGuM', // How To Tuck Crunch
  'Two-Arm_Dumbbell_Preacher_Curl': 'EEStsiL9sG8', // Two Arm Dumbbell Preacher Curl
  'Two-Arm_Kettlebell_Clean': 've3HiSIfguk', // Two Arm Kettlebell Clean
  'Two-Arm_Kettlebell_Jerk': 'gTzU2IV5Gzw', // Two Arm Kettlebell Jerk Technique
  'Two-Arm_Kettlebell_Military_Press': 'ioD3Q6d9PSk', // Two-Arm Kettlebell Military Press
  'Two-Arm_Kettlebell_Row': 'VVRMg9vLs2I', // How to do the Two Arm Kettlebell Row | GrabGains
  Upper_Back_Stretch: 'TMDX7hdQKSY', // Physio Upper Back Stretch & Relieve Desk Break Routine
  'Upper_Back-Leg_Grab': 'JHgSsIuGlB4', // Upper Back Leg Grab Exercise Videos & Guides Bodybuilding com
  Upright_Cable_Row: 'WNz7O59GORA', // How To Do Cable Upright Rows
  'V-Bar_Pullup': 'hLVgs-NfUIQ', // V Bar PullUps
  Vertical_Swing: 'W8qi8mNHVEg', // Vertical Swing Exercise Videos & Guides Bodybuilding com
  Walking_Treadmill: 'UIyZUHq2UdU', // How to run on a treadmill (improve your gait)
  Weighted_Ball_Hyperextension: 'ScYJPz2HkWI', // Weighted Ball Hyperextension Exercise Videos & Guides Bodybuilding com
  Weighted_Ball_Side_Bend: 'rzjvTKQwvRw', // Weighted Ball Side Bend - Abs Exercise
  Weighted_Crunches: 'hFrt1MfEmTU', // How to do weighted crunches? #workout #crunches
  Weighted_Jump_Squat: 'MkZtRo6nPIw', // Weighted Squat Jump | Plyometric Exercise
  Weighted_Sissy_Squat: 'IcWkI1JiARA', // How to do weighted sissy squats
  'Weighted_Sit-Ups_-_With_Bands': 'FQogbZX_JyY', // Weighted Sit-Ups with Bands
  'Wide-Grip_Pulldown_Behind_The_Neck': 'YEvr6b0a5N0', // Wide grip behind the neck pulldown
  'Wide-Grip_Rear_Pull-Up': 'FZNXMxkqamM', // Wide-Grip Rear Pull-Up
  Wind_Sprints: 'ZecmRJ3xuF0', // How to do wind sprints
  Worlds_Greatest_Stretch: 'VQqabRnOR1E', // Worlds Greatest Stretch
  Wrist_Circles: 'wRSk1_C6yOM', // Wrist Circles
  Wrist_Roller: 'Iy_gBgxwRXo', // FOREARM EXERCISE WRIST ROLLER
  Wrist_Rotations_with_Straight_Bar: '_O3JdshSmVA', // Wrist Rotations with Straight Bar - Forearms Exercise
  Yoke_Walk: 'ppyTzw_6BAY', // 350lb Yoke Walk
  // ── Final stragglers (targeted hand-written queries, picked by hand) ──────
  Ankle_On_The_Knee: '2E8WWX4cOc4', // Seated Figure Four Stretch for Piriformis
  Atlas_Stones: 'JqDm3nZiglk', // Atlas Stone Tutorial
  Bicycling: '4ssLDk1eX9w', // 4 Basic Skills For Beginner Cyclists
  Bicycling_Stationary: 'dieOsJlsvpM', // How to use spin bike for beginners
  'Body-Up': 'Mvk58L-fP9A', // Plank to push-up
  Body_Tricep_Press: 'toGzo1GAJ1A', // Bodyweight Skullcrusher
  Bottoms_Up: 'lw8HnB0cEP0', // How to do leg raises correctly
  Car_Drivers: 'CPiNth6zOeI', // Plate Driver Rotation
  Crucifix: 'r27dRHcig6M', // Crucifix holds (shoulder/lat challenge)
  Dancers_Stretch: 'sI44ZU33DjA', // How to do a seated spinal twist
  Heavy_Bag_Thrust: 'Av0hD5PNNpA', // Heavy Bag Thrust exercise guide (BB.com)
  Iron_Cross: 'RP6yDSs-6D0', // Dumbbell Iron Cross
  Runners_Stretch: 'r7Th0lHOhSI', // Dynamic runners lunge + hamstring stretch
  'See-Saw_Press_Alternating_Side_Press': 'lMLYGU3zl-A', // Dumbbell Seesaw Press
  Skating: 'RCSlX4bp24Y', // Inline skating tutorial (first steps)
  Smith_Incline_Shoulder_Raise: 'ZcU8twN7EsA', // Barbell Incline Shoulder Raise (same movement)
  Spinal_Stretch: 'CEGaNMsb8IA', // Seated Spinal Twist
  Standing_Hip_Flexors: 'ljCDEb_MIto', // Standing hip flexor stretch
  Step_Mill: 'k8iktBIyk8I', // How to use a StairMaster (beginners)
  Thigh_Adductor: 'fwpMYCWdUNY', // How to properly use the adductor machine
  Toe_Touchers: 'NR4k8hJfs-8', // Toe touch crunch
  Upward_Stretch: '2iE9p3l-OQ8', // Overhead reach stretch
  Windmills: 'hDrmh7XW4WM', // Standing Windmill
}
