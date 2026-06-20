package com.musclemap.admin.dto;

import jakarta.validation.constraints.NotNull;

/** Admin request to enable or disable a user account (EM9). */
public record UpdateUserStatusRequest(@NotNull Boolean enabled) {
}
