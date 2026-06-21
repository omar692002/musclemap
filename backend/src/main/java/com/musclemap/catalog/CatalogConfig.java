package com.musclemap.catalog;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/** Wires the catalogue module's typed configuration. */
@Configuration
@EnableConfigurationProperties(CatalogProperties.class)
public class CatalogConfig {
}
