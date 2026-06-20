package com.musclemap.coach;

import com.musclemap.auth.AuthenticatedUser;
import com.musclemap.coach.dto.CoachVideoResponse;
import com.musclemap.subscription.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * The consumer side of the Coach Platform: the published content library any
 * signed-in user can read. It lives under {@code /content/**} (not
 * {@code /coach/**}), so it is only {@code anyRequest().authenticated()} — no
 * coach role required to watch.
 *
 * <p>EM11 closes the premium gate: each request resolves the caller's premium
 * entitlement, so premium items come back {@code locked} (url withheld) in the
 * listing, and the per-item watch endpoint is a hard 402 guard.</p>
 */
@RestController
@RequestMapping("${musclemap.api.base-path}/content/videos")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Content", description = "Browse published coach content (any signed-in user)")
public class ContentController {

    private final CoachService coachService;
    private final SubscriptionService subscriptionService;

    public ContentController(CoachService coachService, SubscriptionService subscriptionService) {
        this.coachService = coachService;
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    @Operation(summary = "List published content, newest first (premium items locked for free users)")
    public List<CoachVideoResponse> list(@AuthenticationPrincipal AuthenticatedUser principal) {
        return coachService.listPublished(subscriptionService.isPremium(principal.id()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Watch one published item (402 if premium and the caller is not subscribed)")
    public CoachVideoResponse watch(@AuthenticationPrincipal AuthenticatedUser principal,
                                    @PathVariable UUID id) {
        return coachService.getPublishedForViewer(id, subscriptionService.isPremium(principal.id()));
    }
}
