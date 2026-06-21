package com.musclemap.generator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/** Unit tests for {@link GeneratorServiceImpl} — loads the bundled config resource. */
class GeneratorServiceImplTest {

    private final GeneratorServiceImpl service = new GeneratorServiceImpl(new ObjectMapper());

    @Test
    void servesConfigWithExpectedSections() {
        JsonNode config = service.config();

        assertThat(config.has("splitPatterns")).isTrue();
        assertThat(config.has("goalSchemes")).isTrue();
        assertThat(config.has("strategyByGoal")).isTrue();
        assertThat(config.get("exercisesPerGroup").asInt()).isEqualTo(1);
        assertThat(config.get("optimalGapDays").asInt()).isEqualTo(2);
        assertThat(config.get("splitPatterns").get("PUSH_PULL_LEGS")).hasSize(3);
        assertThat(config.get("goalSchemes").get("strength").get("compound").get("sets").asInt())
                .isEqualTo(5);
    }

    @Test
    void cachesTheLoadedConfig() {
        assertThat(service.config()).isSameAs(service.config());
    }
}
