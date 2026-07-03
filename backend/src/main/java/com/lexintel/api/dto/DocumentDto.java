package com.lexintel.api.dto;

import java.time.LocalDateTime;

/**
 * Full document DTO returned by list/get endpoints.
 * Processing fields are nullable until extraction completes.
 */
public record DocumentDto(
    Long          id,
    String        originalFileName,
    Long          fileSize,
    String        contentType,
    String        status,
    LocalDateTime uploadedAt,

    // ─── Processing fields ────────────────────────────────────────────────────
    String        processingStatus,
    Integer       pageCount,
    String        pdfTitle,
    String        pdfAuthor,
    String        pdfCreationDate,
    String        extractedText,
    LocalDateTime processedAt
) {}
