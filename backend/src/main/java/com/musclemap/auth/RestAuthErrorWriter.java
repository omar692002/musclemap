package com.musclemap.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.musclemap.common.web.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.util.List;

/**
 * Writes the uniform {@link ApiError} envelope for security failures that happen
 * inside the filter chain (before {@code @RestControllerAdvice} can run), so 401/403
 * responses match the shape of every other error in the API.
 */
final class RestAuthErrorWriter {

    private RestAuthErrorWriter() {
    }

    static void write(HttpServletResponse response, HttpServletRequest request,
                      ObjectMapper objectMapper, HttpStatus status, String message) throws IOException {
        ApiError body = ApiError.of(status.value(), status.getReasonPhrase(), message,
                request.getRequestURI(), List.of());
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
