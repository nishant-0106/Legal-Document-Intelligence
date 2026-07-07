package com.lexintel.api.exception;

public class GeminiRateLimitException extends RuntimeException {
    public GeminiRateLimitException(String message) {
        super(message);
    }
    public GeminiRateLimitException(String message, Throwable cause) {
        super(message, cause);
    }
}
