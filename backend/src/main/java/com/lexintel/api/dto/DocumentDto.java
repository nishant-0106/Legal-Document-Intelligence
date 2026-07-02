package com.lexintel.api.dto;

import java.time.LocalDateTime;

public record DocumentDto(
    Long id,
    String originalFileName,
    Long fileSize,
    String contentType,
    String status,
    LocalDateTime uploadedAt
) {}
