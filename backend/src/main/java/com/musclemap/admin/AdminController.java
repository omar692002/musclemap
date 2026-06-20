package com.musclemap.admin;

import com.musclemap.admin.dto.AdminMetricsResponse;
import com.musclemap.admin.dto.AdminUserResponse;
import com.musclemap.admin.dto.UpdateRoleRequest;
import com.musclemap.admin.dto.UpdateUserStatusRequest;
import com.musclemap.auth.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Platform-management endpoints (EM9). The whole controller sits behind
 * {@code /admin/**} → {@code hasRole("ADMIN")} in
 * {@link com.musclemap.config.SecurityConfig}, so reaching any method already
 * implies an authenticated admin; the verified principal is only used to prevent
 * an admin from locking themselves out.
 */
@RestController
@RequestMapping("${musclemap.api.base-path}/admin")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Admin", description = "Platform management: users, roles, and dashboard metrics (ADMIN only)")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/metrics")
    @Operation(summary = "Aggregate platform metrics for the admin dashboard")
    public AdminMetricsResponse metrics() {
        return adminService.metrics();
    }

    @GetMapping("/users")
    @Operation(summary = "List every user account, newest first")
    public List<AdminUserResponse> users() {
        return adminService.listUsers();
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Change a user's authorization role")
    public AdminUserResponse updateRole(@AuthenticationPrincipal AuthenticatedUser principal,
                                        @PathVariable UUID id,
                                        @Valid @RequestBody UpdateRoleRequest request) {
        return adminService.updateRole(principal.id(), id, request.role());
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Enable or disable a user account")
    public AdminUserResponse updateStatus(@AuthenticationPrincipal AuthenticatedUser principal,
                                          @PathVariable UUID id,
                                          @Valid @RequestBody UpdateUserStatusRequest request) {
        return adminService.updateStatus(principal.id(), id, request.enabled());
    }
}
