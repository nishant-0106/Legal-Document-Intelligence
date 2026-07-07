package com.lexintel.api.dto;

public record KeyClauseDto(
    String title,
    String riskLevel,
    String explanation,
    String recommendation
) {}
