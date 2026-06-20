# MuscleMap Backend

Spring Boot 3 backend for the MuscleMap fitness platform. **Milestone 1 — Backend
Foundation**: layered Clean Architecture, PostgreSQL persistence, Flyway-managed
schema, the role taxonomy, and OpenAPI docs. Authentication/JWT land in Milestone 2.

## Stack
- Java 17, Spring Boot 3.3 (Web, Data JPA, Security, Validation, Actuator)
- PostgreSQL 16 + Flyway (schema = single source of truth)
- springdoc-openapi (Swagger UI), Lombok
- Maven; multi-stage Docker image (portable to Render → Docker/ACR/AKS)

## Architecture (Controller → Service → Repository)
```
com.musclemap
├─ config/        SecurityConfig (M1 permissive + BCrypt bean), OpenApiConfig,
│                 MuscleMapProperties (typed config; no magic strings)
├─ common/        BaseEntity (UUID + audit), ApiError, GlobalExceptionHandler,
│                 ResourceNotFoundException
├─ user/          User, UserProfile + enums (Role, Gender, FitnessLevel,
│                 TrainingGoal), repositories, UserService(+Impl)
├─ workout/       GeneratedProgram, WorkoutSession, WorkoutExercise + enums
│                 (SplitType, SessionStatus), repositories
├─ coach/         CoachVideo + repository
├─ subscription/  Subscription + enums (SubscriptionPlan, SubscriptionStatus)
└─ meta/          PlatformService(+Impl), MetaController  (GET /api/v1/meta)
```
**Dependency rule:** controllers depend on service *interfaces*; services depend on
Spring Data repositories. Enum-like columns are `VARCHAR` + `CHECK` constraints kept in
lockstep with the Java enums. `spring.jpa.hibernate.ddl-auto=none` — **Flyway owns the
schema**, Hibernate never alters it.

## Run locally
Prerequisites: JDK 17+, Maven, Docker.

```bash
# 1) Start PostgreSQL (host port 5433 → avoids clashing with a local Postgres on 5432)
docker compose up -d db

# 2) Run the API (dev profile is the default)
mvn spring-boot:run
#   or: mvn -DskipTests package && java -jar target/musclemap-backend-0.1.0.jar
```

Verify:
- Health:   http://localhost:8080/actuator/health
- Meta:     http://localhost:8080/api/v1/meta
- Swagger:  http://localhost:8080/swagger-ui.html

Run the whole stack (API in a container too):
```bash
docker compose --profile full up -d
```

## Tests
```bash
mvn test     # fast unit tests (Mockito); no database/Docker required
```

## Configuration (no hardcoded secrets)
| Env var | Purpose | Dev default |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` or `prod` | `dev` |
| `SPRING_DATASOURCE_URL` | JDBC URL | `jdbc:postgresql://localhost:5433/musclemap` |
| `SPRING_DATASOURCE_USERNAME` | DB user | `musclemap` |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `musclemap` |
| `MUSCLEMAP_CORS_ALLOWED_ORIGINS` | comma-separated allowed origins | localhost dev ports |
| `PORT` | HTTP port | `8080` |

## Deploy to Render
1. New → **Web Service** → connect this repo, root directory `backend`,
   environment **Docker** (uses `backend/Dockerfile`).
2. New → **PostgreSQL** (free tier). Copy its connection fields.
3. On the web service set env vars:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:<port>/<db>`
   - `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
   - `MUSCLEMAP_CORS_ALLOWED_ORIGINS=https://omar692002.github.io`
4. Health check path: `/actuator/health`. Flyway migrates on boot.

The same Docker image runs unchanged on ACR/AKS later — no app rewrite (see
`../ARCHITECTURE.md` → "Deployment evolution").
