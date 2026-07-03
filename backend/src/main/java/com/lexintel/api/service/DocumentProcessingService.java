package com.lexintel.api.service;

import com.lexintel.api.entity.DocumentEntity;
import com.lexintel.api.repository.DocumentRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;

/**
 * Responsible solely for extracting text and metadata from a stored PDF file
 * using Apache PDFBox. Designed with Single Responsibility Principle — it knows
 * nothing about upload, auth, or business rules; it only reads a PDF and persists
 * the result back to the DocumentEntity.
 *
 * <p>Ready for {@code @Async} in the next milestone — simply add {@code @Async}
 * to {@link #process(Long)} and add {@code @EnableAsync} on the application class.
 * The AI analysis phase can then call this directly or rely on its stored output.
 */
@Service
public class DocumentProcessingService {

    private static final Logger log = LoggerFactory.getLogger(DocumentProcessingService.class);

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final DocumentRepository   documentRepository;
    private final FileStorageService   fileStorageService;

    public DocumentProcessingService(DocumentRepository documentRepository,
                                     FileStorageService fileStorageService) {
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Processes the PDF document with the given ID:
     * <ol>
     *   <li>Marks status as PROCESSING.</li>
     *   <li>Extracts text, page count, and metadata via PDFBox.</li>
     *   <li>Persists results and marks status as PROCESSED.</li>
     * </ol>
     * On any error the status is set to FAILED and the exception is swallowed
     * (logged only) — upload already succeeded so we must not propagate.
     *
     * @param documentId ID of the already-saved DocumentEntity to process.
     */
    @Transactional
    public void process(Long documentId) {
        DocumentEntity entity = documentRepository.findById(documentId).orElse(null);
        if (entity == null) {
            log.warn("DocumentProcessingService: document id={} not found, skipping.", documentId);
            return;
        }

        // ── Step 1: Mark as PROCESSING ────────────────────────────────────────
        entity.setProcessingStatus("PROCESSING");
        documentRepository.save(entity);
        log.info("Processing started for document id={} ('{}')", documentId, entity.getOriginalFileName());

        // ── Step 2: Resolve file path ─────────────────────────────────────────
        Path filePath = fileStorageService.resolve(entity.getStoredFileName());
        File file = filePath.toFile();

        if (!file.exists() || !file.isFile()) {
            markFailed(entity, "Physical file not found on disk: " + filePath);
            return;
        }

        // ── Step 3: Extract via PDFBox ────────────────────────────────────────
        try (PDDocument pdDocument = Loader.loadPDF(file)) {

            // Page count
            int pageCount = pdDocument.getNumberOfPages();

            // Metadata
            PDDocumentInformation info = pdDocument.getDocumentInformation();
            String pdfTitle      = sanitize(info.getTitle());
            String pdfAuthor     = sanitize(info.getAuthor());
            String pdfCreationDate = extractDate(info.getCreationDate());

            // Full text extraction
            PDFTextStripper stripper = new PDFTextStripper();
            String extractedText = stripper.getText(pdDocument);

            // ── Step 4: Persist results ───────────────────────────────────────
            entity.setPageCount(pageCount);
            entity.setPdfTitle(pdfTitle);
            entity.setPdfAuthor(pdfAuthor);
            entity.setPdfCreationDate(pdfCreationDate);
            entity.setExtractedText(extractedText != null ? extractedText.trim() : null);
            entity.setProcessingStatus("PROCESSED");
            entity.setProcessedAt(LocalDateTime.now());
            documentRepository.save(entity);

            log.info("Processing completed for document id={}: {} page(s), {} chars of text extracted.",
                    documentId, pageCount,
                    extractedText != null ? extractedText.length() : 0);

        } catch (org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException e) {
            markFailed(entity, "PDF is password-protected and cannot be processed.");
            log.warn("Password-protected PDF for document id={}: {}", documentId, e.getMessage());

        } catch (IOException e) {
            markFailed(entity, "Failed to read PDF — file may be corrupted.");
            log.error("IOException while processing document id={}: {}", documentId, e.getMessage(), e);

        } catch (Exception e) {
            markFailed(entity, "Unexpected error during PDF processing.");
            log.error("Unexpected error while processing document id={}: {}", documentId, e.getMessage(), e);
        }
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private void markFailed(DocumentEntity entity, String reason) {
        entity.setProcessingStatus("FAILED");
        entity.setProcessedAt(LocalDateTime.now());
        documentRepository.save(entity);
        log.warn("Processing FAILED for document id={}: {}", entity.getId(), reason);
    }

    /**
     * Returns null for blank/whitespace-only strings so the DB stores NULL
     * rather than empty strings for missing metadata fields.
     */
    private String sanitize(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    /**
     * Converts a {@link Calendar} creation date from PDF metadata to an
     * ISO-ish string, returning null if the calendar is null.
     */
    private String extractDate(Calendar calendar) {
        if (calendar == null) return null;
        try {
            LocalDateTime ldt = calendar.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
            return ldt.format(DATE_FORMATTER);
        } catch (Exception e) {
            log.debug("Could not parse PDF creation date: {}", e.getMessage());
            return null;
        }
    }
}
