package com.musclemap.subscription;

import com.musclemap.auth.AuthenticatedUser;
import com.musclemap.subscription.dto.SubscriptionResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Subscription endpoints (EM11). All scoped to the <em>current</em> user via the
 * verified principal and sit behind {@code anyRequest().authenticated()} (no role
 * gate). Upgrade/cancel are a Stripe-free mock billing flow; the entitlement they
 * grant is enforced for real by the premium content guard.
 */
@RestController
@RequestMapping("${musclemap.api.base-path}/subscription")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Subscription", description = "Your subscription plan and premium entitlement")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    @Operation(summary = "Your current subscription (provisioned FREE on first read)")
    public SubscriptionResponse current(@AuthenticationPrincipal AuthenticatedUser principal) {
        return subscriptionService.current(principal.id());
    }

    @PostMapping("/upgrade")
    @Operation(summary = "Upgrade to PREMIUM (mock billing — no payment provider yet)")
    public SubscriptionResponse upgrade(@AuthenticationPrincipal AuthenticatedUser principal) {
        return subscriptionService.upgrade(principal.id());
    }

    @PostMapping("/cancel")
    @Operation(summary = "Cancel back to FREE")
    public SubscriptionResponse cancel(@AuthenticationPrincipal AuthenticatedUser principal) {
        return subscriptionService.cancel(principal.id());
    }
}
