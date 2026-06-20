package com.musclemap.auth;

import com.musclemap.config.MuscleMapProperties;
import com.musclemap.user.Role;
import com.musclemap.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Issues and verifies the platform's own stateless access tokens (HS256).
 *
 * <p>The token subject is the user id; {@code email} and {@code role} are carried
 * as claims so the {@link JwtAuthenticationFilter} can build an authenticated
 * principal without touching the database. The signing secret comes from
 * {@code musclemap.security.jwt.secret} and must be at least 32 bytes — a blank
 * or too-short secret fails fast at startup (so prod never boots misconfigured).</p>
 */
@Service
public class JwtService {

    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_NAME = "name";

    private final SecretKey key;
    private final String issuer;
    private final long ttlSeconds;

    public JwtService(MuscleMapProperties properties) {
        MuscleMapProperties.Security.Jwt jwt = properties.getSecurity().jwt();
        String secret = jwt.secret();
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "musclemap.security.jwt.secret must be set to at least 32 bytes. "
                            + "Set MUSCLEMAP_JWT_SECRET (a long random string).");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = jwt.issuer();
        this.ttlSeconds = jwt.ttlSeconds();
    }

    /** Mints a signed access token for the given user. */
    public String generateToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId().toString())
                .issuer(issuer)
                .claim(CLAIM_EMAIL, user.getEmail())
                .claim(CLAIM_ROLE, user.getRole().name())
                .claim(CLAIM_NAME, user.getDisplayName())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(key)
                .compact();
    }

    /**
     * Verifies signature, issuer and expiry, then maps claims to a principal.
     *
     * @throws JwtException if the token is invalid, tampered, or expired
     */
    public AuthenticatedUser parse(String token) {
        Jws<Claims> jws = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token);
        Claims claims = jws.getPayload();
        UUID id = UUID.fromString(claims.getSubject());
        String email = claims.get(CLAIM_EMAIL, String.class);
        Role role = Role.valueOf(claims.get(CLAIM_ROLE, String.class));
        return new AuthenticatedUser(id, email, role);
    }

    /** Token lifetime in seconds (surfaced to clients as {@code expiresInSeconds}). */
    public long ttlSeconds() {
        return ttlSeconds;
    }
}
