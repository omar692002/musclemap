package com.musclemap.meta;

/**
 * Service-layer contract (Dependency Inversion seam) for platform-level metadata.
 * Controllers depend on this interface, never on a concrete implementation.
 */
public interface PlatformService {

    PlatformInfoResponse describe();
}
