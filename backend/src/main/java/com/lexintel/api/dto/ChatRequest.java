package com.lexintel.api.dto;

public record ChatRequest(
        String message,
        Long documentId
) {}
