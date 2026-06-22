package com.musclemap.intel.dto;

import java.util.List;

/** Whole-body intelligence readout returned by GET /intel. */
public record MuscleIntelSummaryResponse(
        boolean hasData,
        List<MuscleGroupIntelResponse> groups,
        long overtrainedCount,
        long undertrainedCount,
        long readyCount
) {}
