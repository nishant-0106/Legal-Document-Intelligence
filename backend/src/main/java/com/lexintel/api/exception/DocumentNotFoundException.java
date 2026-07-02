package com.lexintel.api.exception;

public class DocumentNotFoundException extends RuntimeException {

    public DocumentNotFoundException(String message) {
        super(message);
    }

    public DocumentNotFoundException(Long documentId) {
        super("Document not found with id: " + documentId);
    }
}
