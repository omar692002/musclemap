package com.musclemap.admin;

import com.musclemap.config.MuscleMapProperties;
import com.musclemap.user.Role;
import com.musclemap.user.User;
import com.musclemap.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * First-admin bootstrap (EM9). On startup, elevates any user listed in
 * {@code musclemap.admin.bootstrap-emails} to {@link Role#ADMIN}, so the platform
 * always has an administrator without hand-editing the database. Idempotent:
 * already-ADMIN accounts are skipped, and emails with no matching account are
 * ignored (the owner can sign in first, then a restart grants the role).
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;
    private final MuscleMapProperties properties;

    public AdminBootstrap(UserRepository userRepository, MuscleMapProperties properties) {
        this.userRepository = userRepository;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (String email : properties.getAdmin().bootstrapEmails()) {
            if (email == null || email.isBlank()) {
                continue;
            }
            userRepository.findByEmailIgnoreCase(email.trim())
                    .filter(user -> user.getRole() != Role.ADMIN)
                    .ifPresent(this::promote);
        }
    }

    private void promote(User user) {
        user.setRole(Role.ADMIN);
        userRepository.save(user);
        log.info("Bootstrapped admin role for user {}", user.getEmail());
    }
}
