package com.musclemap.config;

import com.musclemap.user.Role;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Resolves the platform role designated for an email by configuration:
 * {@code musclemap.admin.bootstrap-emails} &rarr; {@link Role#ADMIN} and
 * {@code musclemap.admin.bootstrap-coach-emails} &rarr; {@link Role#COACH}.
 *
 * <p>Shared by {@code AdminBootstrap} (startup reconciliation) and the auth flow
 * (sign-in), so a designated owner/coach receives their role the moment they sign
 * in — no restart and no hand-editing the database. {@link #resolve} only ever
 * <em>raises</em> a role (USER &lt; COACH &lt; ADMIN), never demotes, so an admin
 * who is also listed as a coach stays an admin.</p>
 */
@Component
public class BootstrapRoles {

    private final List<String> adminEmails;
    private final List<String> coachEmails;

    public BootstrapRoles(MuscleMapProperties properties) {
        this.adminEmails = normalizeAll(properties.getAdmin().bootstrapEmails());
        this.coachEmails = normalizeAll(properties.getAdmin().bootstrapCoachEmails());
    }

    /** The role configuration designates for this email, if any (ADMIN wins over COACH). */
    public Optional<Role> designatedRole(String email) {
        String normalized = normalize(email);
        if (normalized == null) {
            return Optional.empty();
        }
        if (adminEmails.contains(normalized)) {
            return Optional.of(Role.ADMIN);
        }
        if (coachEmails.contains(normalized)) {
            return Optional.of(Role.COACH);
        }
        return Optional.empty();
    }

    /**
     * The role the user should hold given their current role and any designation,
     * never lowering an existing role.
     */
    public Role resolve(Role current, String email) {
        Role designated = designatedRole(email).orElse(null);
        if (designated == null) {
            return current;
        }
        if (current == null) {
            return designated;
        }
        // USER(0) < COACH(1) < ADMIN(2): keep whichever is higher.
        return designated.ordinal() > current.ordinal() ? designated : current;
    }

    /** Every email carrying a designation (admins first), for startup reconciliation. */
    public List<String> designatedEmails() {
        List<String> all = new ArrayList<>(adminEmails);
        for (String email : coachEmails) {
            if (!all.contains(email)) {
                all.add(email);
            }
        }
        return List.copyOf(all);
    }

    private static List<String> normalizeAll(List<String> emails) {
        List<String> out = new ArrayList<>();
        if (emails != null) {
            for (String email : emails) {
                String normalized = normalize(email);
                if (normalized != null && !out.contains(normalized)) {
                    out.add(normalized);
                }
            }
        }
        return List.copyOf(out);
    }

    private static String normalize(String email) {
        if (email == null) {
            return null;
        }
        String trimmed = email.trim().toLowerCase();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
