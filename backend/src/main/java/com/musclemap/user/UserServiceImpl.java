package com.musclemap.user;

import com.musclemap.common.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Default {@link UserService}. Passwords are always stored hashed (BCrypt via the
 * injected {@link PasswordEncoder}); the raw password never touches persistence.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public User register(String email, String rawPassword, String displayName, Role role) {
        String normalizedEmail = normalize(email);
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Email already registered: " + normalizedEmail);
        }
        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setDisplayName(displayName);
        user.setRole(role != null ? role : Role.USER);
        user.setAuthProvider(AuthProvider.LOCAL);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User findOrCreateOAuthUser(String email, String displayName, String avatarUrl, AuthProvider provider) {
        String normalizedEmail = normalize(email);
        return userRepository.findByEmailIgnoreCase(normalizedEmail)
                .map(existing -> {
                    // Refresh provider-owned profile fields on each sign-in.
                    if (avatarUrl != null && !avatarUrl.isBlank()) {
                        existing.setAvatarUrl(avatarUrl);
                    }
                    if ((existing.getDisplayName() == null || existing.getDisplayName().isBlank())
                            && displayName != null && !displayName.isBlank()) {
                        existing.setDisplayName(displayName);
                    }
                    existing.setEmailVerified(true);
                    return existing; // managed entity; flushed on commit
                })
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail(normalizedEmail);
                    user.setDisplayName(displayName);
                    user.setAvatarUrl(avatarUrl);
                    user.setRole(Role.USER);
                    user.setAuthProvider(provider != null ? provider : AuthProvider.GOOGLE);
                    user.setEmailVerified(true);
                    // No password hash: OAuth users cannot sign in with a password.
                    return userRepository.save(user);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
    }

    @Override
    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        String normalizedEmail = normalize(email);
        return userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> ResourceNotFoundException.of("User", normalizedEmail));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.existsByEmailIgnoreCase(normalize(email));
    }

    private static String normalize(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email must not be blank");
        }
        return email.trim().toLowerCase();
    }
}
