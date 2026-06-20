package com.musclemap.admin.dto;

import java.util.Map;

/**
 * Platform health snapshot for the admin dashboard (EM9). Pure aggregate counts
 * over the persisted entities — no per-user data leaks here.
 *
 * @param totalUsers       all registered accounts
 * @param usersByRole      headcount per {@link com.musclemap.user.Role} (name → count)
 * @param enabledUsers     accounts that can currently sign in
 * @param localUsers       email/password accounts
 * @param googleUsers      Google sign-in accounts
 * @param totalProfiles    onboarding profiles created
 * @param totalPrograms    generated training programs
 * @param totalSessions    workout sessions of any state
 * @param completedSessions workout sessions marked COMPLETED
 * @param coachVideos      coach video entries
 * @param publishedVideos  coach videos visible to members
 */
public record AdminMetricsResponse(
        long totalUsers,
        Map<String, Long> usersByRole,
        long enabledUsers,
        long localUsers,
        long googleUsers,
        long totalProfiles,
        long totalPrograms,
        long totalSessions,
        long completedSessions,
        long coachVideos,
        long publishedVideos) {
}
