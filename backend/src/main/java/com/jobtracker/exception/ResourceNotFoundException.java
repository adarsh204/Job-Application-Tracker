package com.jobtracker.exception;

/**
 * Thrown when a JobApplication with a given id cannot be found.
 * Caught by GlobalExceptionHandler and turned into a 404 response.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
