package com.musclemap.intel.dto;

/** Effective sets a muscle group received, split by the role it played. */
public record RoleBreakdownResponse(double primary, double secondary, double stabilizer) {}
