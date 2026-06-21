package com.musclemap.config;

import com.musclemap.user.Role;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link BootstrapRoles}: email -> designated role mapping and the
 * never-demote {@link BootstrapRoles#resolve} rule.
 */
class BootstrapRolesTest {

    private static BootstrapRoles roles(List<String> admins, List<String> coaches) {
        MuscleMapProperties props = new MuscleMapProperties(
                null, null, null, null, null,
                new MuscleMapProperties.Admin(admins, coaches));
        return new BootstrapRoles(props);
    }

    @Test
    void mapsAdminAndCoachEmailsCaseInsensitively() {
        BootstrapRoles roles = roles(List.of("Owner@Example.com"), List.of("coach@example.com"));

        assertThat(roles.designatedRole("owner@example.com")).contains(Role.ADMIN);
        assertThat(roles.designatedRole("OWNER@EXAMPLE.COM")).contains(Role.ADMIN);
        assertThat(roles.designatedRole("coach@example.com")).contains(Role.COACH);
        assertThat(roles.designatedRole("nobody@example.com")).isEmpty();
        assertThat(roles.designatedRole(null)).isEmpty();
    }

    @Test
    void adminDesignationWinsOverCoach() {
        BootstrapRoles roles = roles(List.of("both@example.com"), List.of("both@example.com"));
        assertThat(roles.designatedRole("both@example.com")).contains(Role.ADMIN);
    }

    @Test
    void resolveRaisesRoleButNeverDemotes() {
        BootstrapRoles roles = roles(List.of("admin@example.com"), List.of("coach@example.com"));

        // Elevation on first sign-in.
        assertThat(roles.resolve(Role.USER, "admin@example.com")).isEqualTo(Role.ADMIN);
        assertThat(roles.resolve(Role.USER, "coach@example.com")).isEqualTo(Role.COACH);

        // Never demote: an admin listed only as coach stays admin; unknown emails unchanged.
        assertThat(roles.resolve(Role.ADMIN, "coach@example.com")).isEqualTo(Role.ADMIN);
        assertThat(roles.resolve(Role.COACH, "coach@example.com")).isEqualTo(Role.COACH);
        assertThat(roles.resolve(Role.USER, "nobody@example.com")).isEqualTo(Role.USER);
    }

    @Test
    void designatedEmailsUnionsAdminsAndCoachesWithoutDuplicates() {
        BootstrapRoles roles = roles(List.of("a@x.com", "  "), List.of("a@x.com", "c@x.com"));
        assertThat(roles.designatedEmails()).containsExactly("a@x.com", "c@x.com");
    }
}
