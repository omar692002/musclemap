package com.musclemap.catalog;

/**
 * Where a piece of media is hosted / how it must be rendered. {@code FILE} is a
 * directly addressable URL; {@code YOUTUBE} is a video id embedded via iframe.
 * Mirrors the frontend {@code MediaSource}.
 */
public enum MediaSource {
    FILE,
    YOUTUBE
}
