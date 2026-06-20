package com.musclemap.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** OpenAPI / Swagger UI metadata for the MuscleMap API (served at /swagger-ui.html). */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearer-jwt";

    @Bean
    public OpenAPI muscleMapOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MuscleMap API")
                        .description("Backend for the MuscleMap fitness platform. "
                                + "EM2: authentication & security — JWT, BCrypt, RBAC, "
                                + "email/password + Google sign-in.")
                        .version("0.2.0")
                        .contact(new Contact().name("MuscleMap"))
                        .license(new License().name("Proprietary")))
                .components(new Components().addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Paste the token returned by /auth/login, /auth/register or /auth/google.")));
    }
}
