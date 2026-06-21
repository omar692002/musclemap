package com.musclemap.auth;

import com.musclemap.auth.GoogleTokenVerifier.GoogleProfile;
import com.musclemap.auth.dto.AuthResponse;
import com.musclemap.auth.dto.GoogleAuthRequest;
import com.musclemap.auth.dto.LoginRequest;
import com.musclemap.auth.dto.RegisterRequest;
import com.musclemap.auth.dto.UserSummary;
import com.musclemap.config.BootstrapRoles;
import com.musclemap.user.AuthProvider;
import com.musclemap.user.Role;
import com.musclemap.user.User;
import com.musclemap.user.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

/**
 * Default {@link AuthService}. Email/password credentials are checked via the
 * Spring {@link AuthenticationManager} (BCrypt under the hood); Google credentials
 * are verified by {@link GoogleTokenVerifier}. Both paths converge on a single
 * {@link User} and a platform JWT, so RBAC is identical regardless of how the
 * user signed in.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtService jwtService;
    private final BootstrapRoles bootstrapRoles;

    public AuthServiceImpl(UserService userService,
                           AuthenticationManager authenticationManager,
                           GoogleTokenVerifier googleTokenVerifier,
                           JwtService jwtService,
                           BootstrapRoles bootstrapRoles) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.googleTokenVerifier = googleTokenVerifier;
        this.jwtService = jwtService;
        this.bootstrapRoles = bootstrapRoles;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        // New self-service accounts are always standard users; role elevation is an admin action.
        User user = userService.register(request.email(), request.password(), request.displayName(), Role.USER);
        return toResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Throws BadCredentialsException on a wrong email/password (-> 401 via the handler).
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userService.getByEmail(request.email());
        return toResponse(user);
    }

    @Override
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        GoogleProfile profile = googleTokenVerifier.verify(request.credential());
        User user = userService.findOrCreateOAuthUser(
                profile.email(), profile.name(), profile.avatarUrl(), AuthProvider.GOOGLE);
        return toResponse(user);
    }

    private AuthResponse toResponse(User user) {
        // Apply any configured role designation (owner email -> ADMIN, designated
        // coach email -> COACH) so it takes effect on the very first sign-in, with
        // no restart. resolve() never demotes, so this is safe to run every time.
        Role target = bootstrapRoles.resolve(user.getRole(), user.getEmail());
        User effective = target != user.getRole() ? userService.assignRole(user, target) : user;
        String token = jwtService.generateToken(effective);
        return AuthResponse.bearer(token, jwtService.ttlSeconds(), UserSummary.from(effective));
    }
}
