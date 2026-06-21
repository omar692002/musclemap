package com.musclemap.catalog.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.musclemap.catalog.MediaKind;
import com.musclemap.catalog.MediaSource;

/**
 * One media item for an exercise. {@code thumbnailUrl} is omitted when absent so
 * it maps onto the frontend's optional field.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MediaResponse(MediaKind kind, MediaSource source, String url, String thumbnailUrl) {
}
