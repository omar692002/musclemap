package com.musclemap.user;

import com.musclemap.auth.AuthenticatedUser;
import com.musclemap.user.dto.ProfileRequest;
import com.musclemap.user.dto.ProfileResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Premium-onboarding profile endpoints (EM3). Both operations act on the
 * <em>current</em> user (id taken from the verified JWT principal), so a user can
 * only read/write their own profile. The whole controller sits behind
 * {@code anyRequest().authenticated()} in {@link com.musclemap.config.SecurityConfig}.
 */
@RestController
@RequestMapping("${musclemap.api.base-path}/profile")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Profile", description = "Onboarding & personalization data for the current user")
public class ProfileController {

    private final UserProfileService profileService;

    public ProfileController(UserProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    @Operation(summary = "Get the current user's onboarding profile (empty if not completed yet)")
    public ProfileResponse getMyProfile(@AuthenticationPrincipal AuthenticatedUser principal) {
        return profileService.getForUser(principal.id());
    }

    @PutMapping
    @Operation(summary = "Create or update the current user's onboarding profile")
    public ProfileResponse saveMyProfile(@AuthenticationPrincipal AuthenticatedUser principal,
                                         @Valid @RequestBody ProfileRequest request) {
        return profileService.save(principal.id(), request);
    }

    @PostMapping("/skip")
    @Operation(summary = "Dismiss the onboarding prompt for the current user (idempotent)")
    public ProfileResponse skipOnboarding(@AuthenticationPrincipal AuthenticatedUser principal) {
        return profileService.skipOnboarding(principal.id());
    }
}
