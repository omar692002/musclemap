# ---------------------------------------------------------------------------
# Multi-stage build: portable image for Render today, Docker/ACR/AKS later.
# Stage 1 compiles + packages the jar; stage 2 ships a slim JRE runtime.
# ---------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# Cache dependencies first (only re-downloaded when pom.xml changes).
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests clean package

FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app
# Run as a non-root user.
RUN useradd --system --uid 1001 spring
USER spring
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
