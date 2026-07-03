package com.lexintel.api.dto;

import java.time.LocalDateTime;

/**
 * Lightweight response for GET /api/v1/documents/{id}/metadata
 * Returns PDF-level metadata without the (potentially large) extracted text.
 */
public record DocumentMetadataResponse(
    Long          documentId,
    String        processingStatus,
    Integer       pageCount,
    String        pdfTitle,
    String        pdfAuthor,
    String        pdfCreationDate,
    LocalDateTime processedAt
) {}
