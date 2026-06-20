package com.musclemap.auth;

import com.musclemap.config.MuscleMapProperties;
import com.musclemap.user.Role;
import com.musclemap.user.User;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Unit tests for {@link JwtService} (no Spring context, no database). */
class JwtServiceTest {

    private static final String SECRET = "unit-test-signing-secret-at-least-32-bytes-long-0123456789";

    private static JwtService jwtService(String secret) {
        MuscleMapProperties props = new MuscleMapProperties(null, null, null,
                new MuscleMapProperties.Security(new MuscleMapProperties.Security.Jwt(secret, 3600, "musclemap")),
                null);
        return new JwtService(props);
    }

    private static User user(UUID id, String email, Role role) {
        User user = new User();
        ReflectionTestUtils.setField(user, "id", id);
        user.setEmail(email);
        user.setRole(role);
        user.setDisplayName("Ada");
        return user;
    }

    @Test
    void generateThenParse_roundTripsIdentity() {
        JwtService jwt = jwtService(SECRET);
        UUID id = UUID.randomUUID();
        String token = jwt.generateToken(user(id, "ada@example.com", Role.COACH));

        AuthenticatedUser principal = jwt.parse(token);

        assertThat(principal.id()).isEqualTo(id);
        assertThat(principal.email()).isEqualTo("ada@example.com");
        assertThat(principal.role()).isEqualTo(Role.COACH);
    }

    @Test
    void parse_rejectsTamperedToken() {
        JwtService jwt = jwtService(SECRET);
        String token = jwt.generateToken(user(UUID.randomUUID(), "user@example.com", Role.USER));

        assertThatThrownBy(() -> jwt.parse(token + "tampered"))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void parse_rejectsTokenSignedWithAnotherSecret() {
        JwtService issuer = jwtService(SECRET);
        JwtService other = jwtService("a-totally-different-secret-also-32-bytes-long-9876543210");
        String token = issuer.generateToken(user(UUID.randomUUID(), "user@example.com", Role.USER));

        assertThatThrownBy(() -> other.parse(token))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void construction_rejectsTooShortSecret() {
        assertThatThrownBy(() -> jwtService("too-short"))
                .isInstanceOf(IllegalStateException.class);
    }
}
