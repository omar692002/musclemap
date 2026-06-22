package com.musclemap.intel;

import com.musclemap.intel.dto.MuscleIntelSummaryResponse;

import java.util.UUID;

public interface MuscleIntelService {
    MuscleIntelSummaryResponse compute(UUID userId);
}
