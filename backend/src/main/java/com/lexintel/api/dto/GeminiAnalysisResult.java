package com.lexintel.api.dto;

import java.util.List;

public record GeminiAnalysisResult(
    String documentType,
    String summary,
    Integer riskScore,
    String overallRisk,
    List<KeyClause> keyClauses,
    List<String> missingClauses,
    List<String> recommendations,
    List<String> importantDates,
    List<String> parties
) {
    public record KeyClause(
        String title,
        String riskLevel,
        String explanation,
        String recommendation
    ) {}
}
