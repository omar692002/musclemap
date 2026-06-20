package com.musclemap.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.musclemap.config.MuscleMapProperties;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.List;

/**
 * Verifies "Sign in with Google" ID tokens server-side (signature, issuer,
 * audience and expiry) and extracts the profile. This keeps the existing
 * frontend Google sign-in while binding each Google identity to our own
 * {@link com.musclemap.user.User} + JWT — Google is additive, not a replacement
 * for email/password auth.
 */
@Service
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;
    private final boolean configured;

    public GoogleTokenVerifier(MuscleMapProperties properties) {
        String clientId = properties.getOauth().google().clientId();
        this.configured = clientId != null && !clientId.isBlank();
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(configured ? List.of(clientId) : Collections.emptyList())
                .build();
    }

    /**
     * Verifies the GIS credential (an ID token) and returns the Google profile.
     *
     * @throws IllegalStateException    if Google login is not configured on this backend
     * @throws IllegalArgumentException if the token is missing, invalid or fails verification
     */
    public GoogleProfile verify(String idToken) {
        if (!configured) {
            throw new IllegalStateException("Google sign-in is not configured on this server");
        }
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("Missing Google credential");
        }
        try {
            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                throw new IllegalArgumentException("Invalid Google credential");
            }
            Payload payload = token.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new IllegalArgumentException("Google account email is not verified");
            }
            return new GoogleProfile(
                    payload.getEmail(),
                    (String) payload.get("name"),
                    (String) payload.get("picture"));
        } catch (GeneralSecurityException | IOException ex) {
            throw new IllegalArgumentException("Could not verify Google credential");
        }
    }

    /** Verified Google profile fields the platform consumes. */
    public record GoogleProfile(String email, String name, String avatarUrl) {
    }
}
