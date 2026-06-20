package com.musclemap.auth;

import com.musclemap.auth.dto.AuthResponse;
import com.musclemap.auth.dto.GoogleAuthRequest;
import com.musclemap.auth.dto.LoginRequest;
import com.musclemap.auth.dto.RegisterRequest;
import com.musclemap.auth.dto.UserSummary;
import com.musclemap.user.User;
import com.musclemap.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication endpoints (EM2). Registration, login and Google sign-in are
 * public; {@code /auth/me} requires a valid bearer token. Logout is client-side
 * (discard the token) because the platform uses stateless JWTs.
 */
@RestController
@RequestMapping("${musclemap.api.base-path}/auth")
@Tag(name = "Authentication", description = "Registration, login (email/password + Google), and the current session")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new email/password account and return a session token")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate with email/password and return a session token")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/google")
    @Operation(summary = "Exchange a Google Identity credential for a platform session token")
    public AuthResponse google(@Valid @RequestBody GoogleAuthRequest request) {
        return authService.loginWithGoogle(request);
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Return the profile of the currently authenticated user")
    public UserSummary me(@AuthenticationPrincipal AuthenticatedUser principal) {
        User user = userService.getById(principal.id());
        return UserSummary.from(user);
    }
}
