package com.musclemap.admin.dto;

import com.musclemap.user.Role;
import jakarta.validation.constraints.NotNull;

/** Admin request to change a user's authorization role (EM9). */
public record UpdateRoleRequest(@NotNull Role role) {
}
