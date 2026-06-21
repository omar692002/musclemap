package com.musclemap.generator;

import com.fasterxml.jackson.databind.JsonNode;

/** Read access to the program-generator configuration (reference data). */
public interface GeneratorService {

    JsonNode config();
}
