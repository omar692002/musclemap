package com.musclemap.subscription;

/**
 * Thrown when a non-premium user tries to access premium-gated content (EM11).
 * Mapped to HTTP 402 (Payment Required) by the global exception handler — the
 * semantically correct status for "this needs a paid plan", distinct from a 403
 * (authenticated but forbidden by role) so the client can show an upgrade prompt
 * rather than a generic access-denied state.
 */
public class PremiumRequiredException extends RuntimeException {

    public PremiumRequiredException(String message) {
        super(message);
    }

    public static PremiumRequiredException forContent() {
        return new PremiumRequiredException("A premium subscription is required to access this content");
    }
}
