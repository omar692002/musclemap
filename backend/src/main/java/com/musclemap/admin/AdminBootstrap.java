package com.musclemap.admin;

import com.musclemap.config.BootstrapRoles;
import com.musclemap.user.Role;
import com.musclemap.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Role bootstrap (EM9). On startup, reconciles every account designated in
 * {@code musclemap.admin.bootstrap-emails} (&rarr; ADMIN) or
 * {@code bootstrap-coach-emails} (&rarr; COACH) to its configured role via
 * {@link BootstrapRoles}, so the platform always has an administrator (and any
 * designated coaches) without hand-editing the database. Idempotent: accounts
 * already at or above the target role are skipped. Accounts that do not exist yet
 * are handled instead at first sign-in (see {@code AuthServiceImpl}), so a fresh
 * deployment no longer needs a restart after the owner first signs in.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;
    private final BootstrapRoles bootstrapRoles;

    public AdminBootstrap(UserRepository userRepository, BootstrapRoles bootstrapRoles) {
        this.userRepository = userRepository;
        this.bootstrapRoles = bootstrapRoles;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (String email : bootstrapRoles.designatedEmails()) {
            userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
                Role target = bootstrapRoles.resolve(user.getRole(), user.getEmail());
                if (target != user.getRole()) {
                    user.setRole(target);
                    userRepository.save(user);
                    log.info("Bootstrapped {} role for user {}", target, user.getEmail());
                }
            });
        }
    }
}
