package com.lexintel.api.exception;

public class GeminiTimeoutException extends RuntimeException {
    public GeminiTimeoutException(String message) {
        super(message);
    }
    public GeminiTimeoutException(String message, Throwable cause) {
        super(message, cause);
    }
}
