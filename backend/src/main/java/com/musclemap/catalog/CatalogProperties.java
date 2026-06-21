package com.musclemap.catalog;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Media-URL settings used when normalising the catalogue at seed time, mirroring
 * the frontend's {@code DataSourceConfig} / {@code MediaConfig}. Exercise images
 * are not bundled — they are resolved against the upstream free-exercise-db CDN;
 * YouTube thumbnails are built from the curated video ids.
 */
@ConfigurationProperties(prefix = "musclemap.catalog")
public class CatalogProperties {

    private final String imageBaseUrl;
    private final String youtubeThumbnailBaseUrl;
    private final String youtubeThumbnailSuffix;

    public CatalogProperties(String imageBaseUrl, String youtubeThumbnailBaseUrl, String youtubeThumbnailSuffix) {
        this.imageBaseUrl = orDefault(imageBaseUrl,
                "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/");
        this.youtubeThumbnailBaseUrl = orDefault(youtubeThumbnailBaseUrl, "https://img.youtube.com/vi/");
        this.youtubeThumbnailSuffix = orDefault(youtubeThumbnailSuffix, "/hqdefault.jpg");
    }

    private static String orDefault(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }

    public String getImageBaseUrl() {
        return imageBaseUrl;
    }

    /** Absolute URL for a source image path. */
    public String imageUrl(String relativePath) {
        return imageBaseUrl + relativePath;
    }

    /** Still-frame thumbnail URL for a YouTube video id. */
    public String youtubeThumbnailUrl(String videoId) {
        return youtubeThumbnailBaseUrl + videoId + youtubeThumbnailSuffix;
    }
}
