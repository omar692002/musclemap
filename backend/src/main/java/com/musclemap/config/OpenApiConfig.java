package com.musclemap.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** OpenAPI / Swagger UI metadata for the MuscleMap API (served at /swagger-ui.html). */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI muscleMapOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("MuscleMap API")
                .description("Backend for the MuscleMap fitness platform. "
                        + "Milestone 1: foundation (entities, persistence, schema). "
                        + "Authentication/JWT arrive in Milestone 2.")
                .version("0.1.0")
                .contact(new Contact().name("MuscleMap"))
                .license(new License().name("Proprietary")));
    }
}
