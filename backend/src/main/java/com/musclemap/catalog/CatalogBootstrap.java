package com.musclemap.catalog;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.MapType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Seeds the exercise + muscle catalogue into the database on startup from the
 * bundled source resources ({@code catalog/exercises.json} +
 * {@code catalog/exercise-videos.json}), normalising the raw free-exercise-db
 * records the same way the frontend does.
 *
 * <p>Idempotent: each table is populated only when empty, so restarts and
 * existing deployments are no-ops. The catalogue is reference data, not user
 * data, so this is a deliberate replacement for hand-maintained Flyway inserts.</p>
 */
@Component
public class CatalogBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CatalogBootstrap.class);

    private static final String EXERCISES_RESOURCE = "catalog/exercises.json";
    private static final String VIDEOS_RESOURCE = "catalog/exercise-videos.json";

    private final MuscleRepository muscleRepository;
    private final MuscleHeadRepository muscleHeadRepository;
    private final ExerciseRepository exerciseRepository;
    private final CatalogProperties properties;
    private final ObjectMapper objectMapper;

    public CatalogBootstrap(MuscleRepository muscleRepository,
                            MuscleHeadRepository muscleHeadRepository,
                            ExerciseRepository exerciseRepository,
                            CatalogProperties properties,
                            ObjectMapper objectMapper) {
        this.muscleRepository = muscleRepository;
        this.muscleHeadRepository = muscleHeadRepository;
        this.exerciseRepository = exerciseRepository;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws IOException {
        seedMuscles();
        seedExercises();
    }

    private void seedMuscles() {
        if (muscleRepository.count() > 0) {
            return;
        }
        List<Muscle> muscles = CatalogTaxonomy.MUSCLES.stream()
                .map(def -> new Muscle(def.id(), def.name(), def.group()))
                .toList();
        muscleRepository.saveAll(muscles);

        List<MuscleHead> heads = CatalogTaxonomy.MUSCLE_HEADS.stream()
                .map(def -> new MuscleHead(def.id(), def.parentMuscleId(), def.name()))
                .toList();
        muscleHeadRepository.saveAll(heads);
        log.info("Seeded {} muscles and {} heads", muscles.size(), heads.size());
    }

    private void seedExercises() throws IOException {
        if (exerciseRepository.count() > 0) {
            return;
        }
        Map<String, String> videoIds = readVideoIds();
        List<RawExercise> raws = readRawExercises();
        ExerciseNormalizer normalizer = new ExerciseNormalizer(properties, videoIds);

        List<Exercise> exercises = new ArrayList<>(raws.size());
        for (RawExercise raw : raws) {
            exercises.add(normalizer.normalize(raw));
        }
        exerciseRepository.saveAll(exercises);
        log.info("Seeded {} exercises from {}", exercises.size(), EXERCISES_RESOURCE);
    }

    private List<RawExercise> readRawExercises() throws IOException {
        try (InputStream in = open(EXERCISES_RESOURCE)) {
            return objectMapper.readValue(in, objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, RawExercise.class));
        }
    }

    private Map<String, String> readVideoIds() throws IOException {
        try (InputStream in = open(VIDEOS_RESOURCE)) {
            MapType type = objectMapper.getTypeFactory()
                    .constructMapType(Map.class, String.class, String.class);
            return objectMapper.readValue(in, type);
        }
    }

    private InputStream open(String path) throws IOException {
        Resource resource = new ClassPathResource(path);
        if (!resource.exists()) {
            throw new IOException("Catalogue resource not found on classpath: " + path);
        }
        return resource.getInputStream();
    }
}
