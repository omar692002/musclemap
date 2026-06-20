package com.musclemap.common.web;

import java.time.Instant;
import java.util.List;

/**
 * Uniform error envelope returned by the global exception handler.
 *
 * @param timestamp when the error occurred
 * @param status    HTTP status code
 * @param error     HTTP status reason phrase
 * @param message   human-readable summary
 * @param path      request path
 * @param details   optional field-level validation messages
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<String> details
) {
    public static ApiError of(int status, String error, String message, String path, List<String> details) {
        return new ApiError(Instant.now(), status, error, message, path, details == null ? List.of() : details);
    }
}
