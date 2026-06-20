package com.musclemap.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Typed binding for {@code musclemap.*} configuration. Centralizes the API base
 * path, CORS origins, JWT signing and Google OAuth client id so nothing is
 * hardcoded at a call site (single source of truth).
 */
@ConfigurationProperties(prefix = "musclemap")
public class MuscleMapProperties {

    private final App app;
    private final Api api;
    private final Cors cors;
    private final Security security;
    private final Oauth oauth;

    public MuscleMapProperties(App app, Api api, Cors cors, Security security, Oauth oauth) {
        this.app = app != null ? app : new App("MuscleMap", "0.1.0", "M1 - Backend Foundation");
        this.api = api != null ? api : new Api("/api/v1");
        this.cors = cors != null ? cors : new Cors(List.of());
        this.security = security != null ? security : new Security(null);
        this.oauth = oauth != null ? oauth : new Oauth(null);
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

    public Security getSecurity() {
        return security;
    }

    public Oauth getOauth() {
        return oauth;
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

    /** Security / JWT settings (EM2). */
    public record Security(Jwt jwt) {
        public Security {
            jwt = jwt != null ? jwt : new Jwt(null, 0, null);
        }

        /**
         * HS256 signing config. {@code secret} must be supplied per environment
         * (a long random string &ge; 32 bytes); it is intentionally not defaulted
         * so production fails fast if the secret is missing.
         */
        public record Jwt(String secret, long ttlSeconds, String issuer) {
            public Jwt {
                if (ttlSeconds <= 0) {
                    ttlSeconds = 86_400; // 24h
                }
                if (issuer == null || issuer.isBlank()) {
                    issuer = "musclemap";
                }
            }
        }
    }

    /** External identity providers (EM2). */
    public record Oauth(Google google) {
        public Oauth {
            google = google != null ? google : new Google(null);
        }

        /** Google Identity client id; the audience our backend validates ID tokens against. */
        public record Google(String clientId) {
            public Google {
                clientId = clientId != null ? clientId : "";
            }
        }
    }
}
