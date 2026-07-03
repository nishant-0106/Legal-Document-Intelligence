package com.lexintel.api.dto;

/**
 * Lightweight response for GET /api/v1/documents/{id}/text
 * Carries only the extracted text and current processing status,
 * keeping the payload small for future AI consumption.
 */
public record DocumentTextResponse(
    Long   documentId,
    String processingStatus,
    String extractedText
) {}
