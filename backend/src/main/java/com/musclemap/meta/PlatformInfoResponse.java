package com.musclemap.meta;

import java.util.List;

/**
 * Read-only platform descriptor returned by {@code GET /api/v1/meta}. Lets the
 * frontend discover the API version, the current build milestone and the canonical
 * enum vocabularies (roles, goals, splits, plans) without hardcoding them.
 *
 * @param name      application name
 * @param version   API/build version
 * @param milestone current roadmap milestone
 * @param roles     authorization roles
 * @param goals     training goals
 * @param splits    program split types
 * @param plans     subscription plans
 * @param totalUsers registered user count (proves the persistence wiring end-to-end)
 */
public record PlatformInfoResponse(
        String name,
        String version,
        String milestone,
        List<String> roles,
        List<String> goals,
        List<String> splits,
        List<String> plans,
        long totalUsers
) {
}
