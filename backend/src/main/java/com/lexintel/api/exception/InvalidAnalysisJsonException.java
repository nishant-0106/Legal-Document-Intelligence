package com.lexintel.api.exception;

public class InvalidAnalysisJsonException extends RuntimeException {
    public InvalidAnalysisJsonException(String message) {
        super(message);
    }
    public InvalidAnalysisJsonException(String message, Throwable cause) {
        super(message, cause);
    }
}
