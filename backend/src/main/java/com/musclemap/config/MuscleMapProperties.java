package com.musclemap.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Typed binding for {@code musclemap.*} configuration. Centralizes the API base
 * path and CORS origins so no controller hardcodes them (single source of truth).
 */
@ConfigurationProperties(prefix = "musclemap")
public class MuscleMapProperties {

    private final App app;
    private final Api api;
    private final Cors cors;

    public MuscleMapProperties(App app, Api api, Cors cors) {
        this.app = app != null ? app : new App("MuscleMap", "0.1.0", "M1 - Backend Foundation");
        this.api = api != null ? api : new Api("/api/v1");
        this.cors = cors != null ? cors : new Cors(List.of());
    }

    public App getApp() {
        return app;
    }

    public Api getApi() {
        return api;
    }

    public Cors getCors() {
        return cors;
    }

    /** Application descriptor surfaced by the meta endpoint. */
    public record App(String name, String version, String milestone) {
    }

    /** REST API settings. */
    public record Api(String basePath) {
        public Api {
            if (basePath == null || basePath.isBlank()) {
                basePath = "/api/v1";
            }
        }
    }

    /** CORS settings. */
    public record Cors(List<String> allowedOrigins) {
        public Cors {
            allowedOrigins = allowedOrigins != null ? List.copyOf(allowedOrigins) : List.of();
        }
    }
}
