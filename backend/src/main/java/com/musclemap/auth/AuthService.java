package com.musclemap.auth;

import com.musclemap.auth.dto.AuthResponse;
import com.musclemap.auth.dto.GoogleAuthRequest;
import com.musclemap.auth.dto.LoginRequest;
import com.musclemap.auth.dto.RegisterRequest;

/**
 * Orchestrates the EM2 authentication flows. Each method returns a freshly
 * minted platform JWT plus the authenticated user. Logout is intentionally
 * absent: tokens are stateless, so the client simply discards its token.
 */
public interface AuthService {

    /** Registers a new local (email/password) account and signs it in. */
    AuthResponse register(RegisterRequest request);

    /** Authenticates an email/password account. */
    AuthResponse login(LoginRequest request);

    /** Verifies a Google ID token, provisions/links the user, and signs it in. */
    AuthResponse loginWithGoogle(GoogleAuthRequest request);
}
