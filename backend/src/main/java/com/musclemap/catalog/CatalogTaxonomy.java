package com.musclemap.catalog;

import com.musclemap.user.Equipment;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * The authored muscle taxonomy and the source-vocabulary translation tables,
 * ported from the frontend single source of truth ({@code src/data/static/**}).
 * The {@link CatalogBootstrap} seeder uses these to normalise the raw
 * free-exercise-db records into our entities. Muscle/head ids are the frontend's
 * stable kebab-case identifiers so both stacks stay interchangeable.
 */
final class CatalogTaxonomy {

    private CatalogTaxonomy() {
    }

    record MuscleDef(String id, String name, MuscleGroup group) {
    }

    record HeadDef(String id, String parentMuscleId, String name) {
    }

    static final List<MuscleDef> MUSCLES = List.of(
            new MuscleDef("pectoralis-major", "Pectoralis Major", MuscleGroup.CHEST),
            new MuscleDef("latissimus-dorsi", "Latissimus Dorsi", MuscleGroup.BACK),
            new MuscleDef("trapezius", "Trapezius", MuscleGroup.BACK),
            new MuscleDef("rhomboids", "Rhomboids", MuscleGroup.BACK),
            new MuscleDef("erector-spinae", "Erector Spinae", MuscleGroup.BACK),
            new MuscleDef("deltoid", "Deltoid", MuscleGroup.SHOULDERS),
            new MuscleDef("biceps-brachii", "Biceps Brachii", MuscleGroup.BICEPS),
            new MuscleDef("triceps-brachii", "Triceps Brachii", MuscleGroup.TRICEPS),
            new MuscleDef("forearms", "Forearms", MuscleGroup.FOREARMS),
            new MuscleDef("rectus-abdominis", "Abdominals", MuscleGroup.CORE),
            new MuscleDef("quadriceps", "Quadriceps", MuscleGroup.QUADRICEPS),
            new MuscleDef("hamstrings", "Hamstrings", MuscleGroup.HAMSTRINGS),
            new MuscleDef("gluteus", "Gluteus", MuscleGroup.GLUTES),
            new MuscleDef("calves", "Calves", MuscleGroup.CALVES),
            new MuscleDef("neck", "Neck", MuscleGroup.NECK),
            new MuscleDef("hip-abductors", "Hip Abductors", MuscleGroup.ABDUCTORS),
            new MuscleDef("hip-adductors", "Hip Adductors", MuscleGroup.ADDUCTORS));

    static final List<HeadDef> MUSCLE_HEADS = List.of(
            new HeadDef("deltoid-anterior", "deltoid", "Anterior deltoid"),
            new HeadDef("deltoid-lateral", "deltoid", "Lateral deltoid"),
            new HeadDef("deltoid-posterior", "deltoid", "Posterior deltoid"),
            new HeadDef("pec-upper", "pectoralis-major", "Upper chest"),
            new HeadDef("pec-mid", "pectoralis-major", "Mid chest"),
            new HeadDef("pec-lower", "pectoralis-major", "Lower chest"),
            new HeadDef("triceps-long", "triceps-brachii", "Triceps long head"),
            new HeadDef("triceps-lateral", "triceps-brachii", "Triceps lateral head"),
            new HeadDef("triceps-medial", "triceps-brachii", "Triceps medial head"),
            new HeadDef("biceps-long", "biceps-brachii", "Biceps long head"),
            new HeadDef("biceps-short", "biceps-brachii", "Biceps short head"),
            new HeadDef("traps-upper", "trapezius", "Upper trapezius"),
            new HeadDef("traps-mid", "trapezius", "Middle trapezius"),
            new HeadDef("traps-lower", "trapezius", "Lower trapezius"),
            new HeadDef("calf-gastrocnemius", "calves", "Gastrocnemius"),
            new HeadDef("calf-soleus", "calves", "Soleus"),
            new HeadDef("quad-rectus-femoris", "quadriceps", "Rectus femoris"),
            new HeadDef("quad-vastus-lateralis", "quadriceps", "Vastus lateralis"),
            new HeadDef("quad-vastus-medialis", "quadriceps", "Vastus medialis"),
            new HeadDef("quad-vastus-intermedius", "quadriceps", "Vastus intermedius"),
            new HeadDef("ham-biceps-femoris", "hamstrings", "Biceps femoris"),
            new HeadDef("ham-semitendinosus", "hamstrings", "Semitendinosus"),
            new HeadDef("ham-semimembranosus", "hamstrings", "Semimembranosus"));

    /** free-exercise-db muscle name -> our muscle id. */
    static final Map<String, String> SOURCE_MUSCLE_TO_ID = Map.ofEntries(
            Map.entry("abdominals", "rectus-abdominis"),
            Map.entry("abductors", "hip-abductors"),
            Map.entry("adductors", "hip-adductors"),
            Map.entry("biceps", "biceps-brachii"),
            Map.entry("calves", "calves"),
            Map.entry("chest", "pectoralis-major"),
            Map.entry("forearms", "forearms"),
            Map.entry("glutes", "gluteus"),
            Map.entry("hamstrings", "hamstrings"),
            Map.entry("lats", "latissimus-dorsi"),
            Map.entry("lower back", "erector-spinae"),
            Map.entry("middle back", "rhomboids"),
            Map.entry("neck", "neck"),
            Map.entry("quadriceps", "quadriceps"),
            Map.entry("shoulders", "deltoid"),
            Map.entry("traps", "trapezius"),
            Map.entry("triceps", "triceps-brachii"));

    static final Map<String, Equipment> SOURCE_EQUIPMENT = Map.ofEntries(
            Map.entry("bands", Equipment.BANDS),
            Map.entry("barbell", Equipment.BARBELL),
            Map.entry("body only", Equipment.BODYWEIGHT),
            Map.entry("cable", Equipment.CABLE),
            Map.entry("dumbbell", Equipment.DUMBBELL),
            Map.entry("e-z curl bar", Equipment.EZ_CURL_BAR),
            Map.entry("exercise ball", Equipment.EXERCISE_BALL),
            Map.entry("foam roll", Equipment.FOAM_ROLL),
            Map.entry("kettlebells", Equipment.KETTLEBELL),
            Map.entry("machine", Equipment.MACHINE),
            Map.entry("medicine ball", Equipment.MEDICINE_BALL),
            Map.entry("other", Equipment.OTHER));

    static final Map<String, ExerciseMechanic> SOURCE_MECHANIC = Map.of(
            "compound", ExerciseMechanic.COMPOUND,
            "isolation", ExerciseMechanic.ISOLATION);

    static final Map<String, ExerciseForce> SOURCE_FORCE = Map.of(
            "push", ExerciseForce.PUSH,
            "pull", ExerciseForce.PULL,
            "static", ExerciseForce.STATIC);

    static final Map<String, ExerciseLevel> SOURCE_LEVEL = Map.of(
            "beginner", ExerciseLevel.BEGINNER,
            "intermediate", ExerciseLevel.INTERMEDIATE,
            "expert", ExerciseLevel.EXPERT);

    static final Map<String, ExerciseCategory> SOURCE_CATEGORY = Map.ofEntries(
            Map.entry("cardio", ExerciseCategory.CARDIO),
            Map.entry("olympic weightlifting", ExerciseCategory.OLYMPIC_WEIGHTLIFTING),
            Map.entry("plyometrics", ExerciseCategory.PLYOMETRICS),
            Map.entry("powerlifting", ExerciseCategory.POWERLIFTING),
            Map.entry("strength", ExerciseCategory.STRENGTH),
            Map.entry("stretching", ExerciseCategory.STRETCHING),
            Map.entry("strongman", ExerciseCategory.STRONGMAN));

    /** Default per-role volume contribution (0..1) until per-exercise curation. */
    static final Map<MuscleRole, BigDecimal> ROLE_DEFAULT_CONTRIBUTION = Map.of(
            MuscleRole.PRIMARY, new BigDecimal("1.00"),
            MuscleRole.SECONDARY, new BigDecimal("0.50"),
            MuscleRole.STABILIZER, new BigDecimal("0.25"));
}
