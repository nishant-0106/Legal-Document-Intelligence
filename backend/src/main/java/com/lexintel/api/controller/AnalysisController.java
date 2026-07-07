package com.lexintel.api.controller;

import com.lexintel.api.dto.AnalysisDto;
import com.lexintel.api.dto.AnalysisStatusResponse;
import com.lexintel.api.service.DocumentAnalysisService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/documents")
public class AnalysisController {

    private static final Logger log = LoggerFactory.getLogger(AnalysisController.class);

    private final DocumentAnalysisService documentAnalysisService;

    public AnalysisController(DocumentAnalysisService documentAnalysisService) {
        this.documentAnalysisService = documentAnalysisService;
    }

    /**
     * Trigger legal document analysis. Runs synchronously and returns the complete analysis.
     */
    @PostMapping("/{id}/analyze")
    public ResponseEntity<AnalysisDto> analyze(
            @PathVariable Long id,
            Authentication authentication) {

        String email = (String) authentication.getPrincipal();
        log.info("Analysis request for document id={} from user '{}'", id, email);

        AnalysisDto analysis = documentAnalysisService.analyzeDocument(id, email);

        return ResponseEntity.ok(analysis);
    }

    /**
     * Retrieve the analysis results for a document.
     */
    @GetMapping("/{id}/analysis")
    public ResponseEntity<AnalysisDto> getAnalysis(
            @PathVariable Long id,
            Authentication authentication) {

        String email = (String) authentication.getPrincipal();
        log.info("Get analysis request for document id={} from user '{}'", id, email);

        AnalysisDto analysis = documentAnalysisService.getAnalysisByDocumentId(id, email);

        return ResponseEntity.ok(analysis);
    }

    /**
     * Get the analysis/processing status of a document.
     */
    @GetMapping("/{id}/analysis/status")
    public ResponseEntity<AnalysisStatusResponse> getStatus(
            @PathVariable Long id,
            Authentication authentication) {

        String email = (String) authentication.getPrincipal();
        log.info("Get analysis status request for document id={} from user '{}'", id, email);

        AnalysisStatusResponse status = documentAnalysisService.getAnalysisStatus(id, email);

        return ResponseEntity.ok(status);
    }
}
