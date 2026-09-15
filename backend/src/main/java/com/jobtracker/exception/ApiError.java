package com.jobtracker.exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Consistent JSON shape for every error response the API sends back.
 * Having one predictable error format makes the frontend's error-handling
 * code (and any interviewer reading it) much simpler than guessing the
 * shape of Spring's default error payloads.
 */
public class ApiError {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private Map<String, String> fieldErrors; // only populated for validation failures

    public ApiError(int status, String error, String message) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
    }

    public ApiError(int status, String error, String message, Map<String, String> fieldErrors) {
        this(status, error, message);
        this.fieldErrors = fieldErrors;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
