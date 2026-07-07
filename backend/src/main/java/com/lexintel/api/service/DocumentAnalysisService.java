package com.lexintel.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lexintel.api.dto.AnalysisDto;
import com.lexintel.api.dto.KeyClauseDto;
import com.lexintel.api.dto.GeminiAnalysisResult;
import com.lexintel.api.dto.AnalysisStatusResponse;
import com.lexintel.api.entity.AnalysisEntity;
import com.lexintel.api.entity.DocumentEntity;
import com.lexintel.api.entity.UserEntity;
import com.lexintel.api.exception.DocumentNotFoundException;
import com.lexintel.api.exception.InvalidAnalysisJsonException;
import com.lexintel.api.exception.InvalidFileException;
import com.lexintel.api.repository.AnalysisRepository;
import com.lexintel.api.repository.DocumentRepository;
import com.lexintel.api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class DocumentAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(DocumentAnalysisService.class);

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final AnalysisRepository analysisRepository;
    private final AIAnalysisService aiAnalysisService;
    private final ObjectMapper objectMapper;

    public DocumentAnalysisService(DocumentRepository documentRepository,
                                   UserRepository userRepository,
                                   AnalysisRepository analysisRepository,
                                   AIAnalysisService aiAnalysisService,
                                   ObjectMapper objectMapper) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.analysisRepository = analysisRepository;
        this.aiAnalysisService = aiAnalysisService;
        this.objectMapper = objectMapper;
    }

    /**
     * Run legal document analysis using Gemini API, parse and validate the JSON response,
     * persist it as an AnalysisEntity linked to the DocumentEntity, and set document status to ANALYZED.
     */
    @Transactional
    public AnalysisDto analyzeDocument(Long documentId, String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + userEmail));

        DocumentEntity document = documentRepository.findByIdAndUserId(documentId, user.getId())
                .orElseThrow(() -> new DocumentNotFoundException(documentId));

        // Validation: Must be PROCESSED and have extracted text
        if (!"PROCESSED".equalsIgnoreCase(document.getProcessingStatus())) {
            throw new InvalidFileException("Document text has not been extracted yet. Processing status is: " + document.getProcessingStatus());
        }

        String extractedText = document.getExtractedText();
        if (extractedText == null || extractedText.isBlank()) {
            throw new InvalidFileException("The document has no extracted text to analyze.");
        }

        // Check if an analysis already exists for this document. If so, return it instead of calling Gemini again.
        // Wait, the requirement says "Each document should have its own analysis record. Do not overwrite the original document."
        // If they ask to run POST, we can overwrite the existing analysis record for this document, or reuse it.
        // Let's delete the existing analysis if they explicitly POST to /analyze to re-run, or update it.
        // Overwriting the analysis record for the *same* document is perfectly fine and expected if they re-run POST /analyze.
        // But let's check: we should create it or update it. Updating is safer.
        AnalysisEntity existingAnalysis = analysisRepository.findByDocumentId(documentId).orElse(null);

        // Call Gemini
        GeminiAnalysisResult result;
        try {
            result = aiAnalysisService.analyzeText(extractedText);
        } catch (Exception ex) {
            log.error("Failed to parse Gemini response to expected JSON structure", ex);
            throw new InvalidAnalysisJsonException("Failed to parse AI analysis. The model returned invalid JSON structure.", ex);
        }

        // Serialize fields to JSON
        String keyClausesJson = serialize(result.keyClauses());
        String missingClausesJson = serialize(result.missingClauses());
        String recommendationsJson = serialize(result.recommendations());
        String importantDatesJson = serialize(result.importantDates());
        String partiesJson = serialize(result.parties());

        AnalysisEntity analysis;
        if (existingAnalysis != null) {
            analysis = existingAnalysis;
            analysis.setDocumentType(result.documentType());
            analysis.setSummary(result.summary());
            analysis.setRiskScore(result.riskScore());
            analysis.setOverallRisk(result.overallRisk());
            analysis.setKeyClausesJson(keyClausesJson);
            analysis.setMissingClausesJson(missingClausesJson);
            analysis.setRecommendationsJson(recommendationsJson);
            analysis.setImportantDatesJson(importantDatesJson);
            analysis.setPartiesJson(partiesJson);
            analysis.setAnalyzedAt(LocalDateTime.now());
        } else {
            analysis = new AnalysisEntity(
                    document,
                    result.documentType(),
                    result.summary(),
                    result.riskScore(),
                    result.overallRisk(),
                    keyClausesJson,
                    missingClausesJson,
                    recommendationsJson,
                    importantDatesJson,
                    partiesJson
            );
        }

        analysis = analysisRepository.save(analysis);

        // Update document status to ANALYZED
        document.setStatus("ANALYZED");
        documentRepository.save(document);

        log.info("Successfully analyzed and saved document id={}, riskScore={}", documentId, analysis.getRiskScore());

        return toDto(analysis);
    }

    /**
     * Get the analysis for a document.
     */
    @Transactional(readOnly = true)
    public AnalysisDto getAnalysisByDocumentId(Long documentId, String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + userEmail));

        // Verify document ownership
        DocumentEntity document = documentRepository.findByIdAndUserId(documentId, user.getId())
                .orElseThrow(() -> new DocumentNotFoundException(documentId));

        AnalysisEntity analysis = analysisRepository.findByDocumentId(document.getId())
                .orElseThrow(() -> new DocumentNotFoundException("Analysis not found for document id: " + documentId));

        return toDto(analysis);
    }

    /**
     * Check the status of document analysis.
     */
    @Transactional(readOnly = true)
    public AnalysisStatusResponse getAnalysisStatus(Long documentId, String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + userEmail));

        // Verify document ownership
        DocumentEntity document = documentRepository.findByIdAndUserId(documentId, user.getId())
                .orElseThrow(() -> new DocumentNotFoundException(documentId));

        // Check if analyzed
        boolean isAnalyzed = analysisRepository.findByDocumentId(document.getId()).isPresent();
        if (isAnalyzed) {
            return new AnalysisStatusResponse(document.getId(), "ANALYZED");
        }

        // Return current processing status
        return new AnalysisStatusResponse(document.getId(), document.getProcessingStatus());
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private GeminiAnalysisResult parseAndValidateJson(String rawJson) {
        String cleanJson = rawJson.trim();
        // Resilience: Strip markdown code blocks if the LLM wrapped them
        if (cleanJson.startsWith("```")) {
            int firstLineBreak = cleanJson.indexOf('\n');
            if (firstLineBreak != -1) {
                cleanJson = cleanJson.substring(firstLineBreak + 1);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();
        }

        GeminiAnalysisResult result;
        try {
            result = objectMapper.readValue(cleanJson, GeminiAnalysisResult.class);
        } catch (Exception ex) {
            log.error("Failed to parse Gemini response to expected JSON structure: {}", cleanJson, ex);
            throw new InvalidAnalysisJsonException("Failed to parse AI analysis. The model returned invalid JSON structure.", ex);
        }

        // Validate required fields
        if (result.documentType() == null || result.documentType().isBlank()) {
            throw new InvalidAnalysisJsonException("AI analysis missing 'documentType' field.");
        }
        if (result.summary() == null || result.summary().isBlank()) {
            throw new InvalidAnalysisJsonException("AI analysis missing 'summary' field.");
        }
        if (result.riskScore() == null) {
            throw new InvalidAnalysisJsonException("AI analysis missing 'riskScore' field.");
        }
        if (result.overallRisk() == null || result.overallRisk().isBlank()) {
            throw new InvalidAnalysisJsonException("AI analysis missing 'overallRisk' field.");
        }
        if (result.keyClauses() == null) {
            throw new InvalidAnalysisJsonException("AI analysis missing 'keyClauses' array.");
        }

        return result;
    }

    private String serialize(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception ex) {
            log.error("Failed to serialize object to JSON: {}", obj, ex);
            return "[]";
        }
    }

    private <T> T deserialize(String json, TypeReference<T> typeRef) {
        if (json == null || json.isBlank() || "[]".equals(json)) {
            return (T) Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, typeRef);
        } catch (Exception ex) {
            log.error("Failed to deserialize JSON to target type: {}", json, ex);
            return (T) Collections.emptyList();
        }
    }

    private AnalysisDto toDto(AnalysisEntity entity) {
        List<GeminiAnalysisResult.KeyClause> keyClausesRaw = deserialize(
                entity.getKeyClausesJson(),
                new TypeReference<List<GeminiAnalysisResult.KeyClause>>() {}
        );

        List<KeyClauseDto> keyClauses = keyClausesRaw.stream()
                .map(kc -> new KeyClauseDto(kc.title(), kc.riskLevel(), kc.explanation(), kc.recommendation()))
                .toList();

        List<String> missingClauses = deserialize(entity.getMissingClausesJson(), new TypeReference<List<String>>() {});
        List<String> recommendations = deserialize(entity.getRecommendationsJson(), new TypeReference<List<String>>() {});
        List<String> importantDates = deserialize(entity.getImportantDatesJson(), new TypeReference<List<String>>() {});
        List<String> parties = deserialize(entity.getPartiesJson(), new TypeReference<List<String>>() {});

        return new AnalysisDto(
                entity.getId(),
                entity.getDocument().getId(),
                entity.getDocumentType(),
                entity.getSummary(),
                entity.getRiskScore(),
                entity.getOverallRisk(),
                keyClauses,
                missingClauses,
                recommendations,
                importantDates,
                parties,
                entity.getAnalyzedAt()
        );
    }
}
