package com.musclemap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Entry point for the MuscleMap backend.
 *
 * <p>Milestone 1 (Backend Foundation): layered Clean Architecture
 * (controller -> service -> repository), PostgreSQL via JPA, Flyway-managed
 * schema, role taxonomy, and OpenAPI docs. Authentication/JWT arrive in M2.</p>
 */
@SpringBootApplication
@EnableJpaAuditing
public class MuscleMapApplication {

    public static void main(String[] args) {
        SpringApplication.run(MuscleMapApplication.class, args);
    }
}
