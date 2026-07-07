package com.lexintel.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AnalysisDto(
    Long id,
    Long documentId,
    String documentType,
    String summary,
    Integer riskScore,
    String overallRisk,
    List<KeyClauseDto> keyClauses,
    List<String> missingClauses,
    List<String> recommendations,
    List<String> importantDates,
    List<String> parties,
    LocalDateTime analyzedAt
) {}
