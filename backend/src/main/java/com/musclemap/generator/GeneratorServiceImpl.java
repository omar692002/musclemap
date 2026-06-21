package com.musclemap.generator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;

/**
 * Serves the program-generator config from the bundled JSON resource
 * ({@code generator/config.json}), loaded once and cached. The document is the
 * single source of truth the frontend's generator consumes (dual-path, with its
 * bundled copy as the offline fallback). Served as-is — it carries no behaviour,
 * only the generator's tuning (splits, goal schemes, layouts, progression).
 */
@Service
public class GeneratorServiceImpl implements GeneratorService {

    private static final String CONFIG_RESOURCE = "generator/config.json";

    private final ObjectMapper objectMapper;
    private volatile JsonNode config;

    public GeneratorServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public JsonNode config() {
        JsonNode cached = config;
        if (cached == null) {
            synchronized (this) {
                cached = config;
                if (cached == null) {
                    cached = load();
                    config = cached;
                }
            }
        }
        return cached;
    }

    private JsonNode load() {
        Resource resource = new ClassPathResource(CONFIG_RESOURCE);
        try (InputStream in = resource.getInputStream()) {
            return objectMapper.readTree(in);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to load " + CONFIG_RESOURCE, e);
        }
    }
}
