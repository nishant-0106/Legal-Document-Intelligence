package com.lexintel.api.service;

import com.lexintel.api.dto.DocumentDto;
import com.lexintel.api.dto.DocumentMetadataResponse;
import com.lexintel.api.dto.DocumentTextResponse;
import com.lexintel.api.entity.DocumentEntity;
import com.lexintel.api.entity.UserEntity;
import com.lexintel.api.exception.DocumentNotFoundException;
import com.lexintel.api.exception.InvalidFileException;
import com.lexintel.api.repository.DocumentRepository;
import com.lexintel.api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private static final String ALLOWED_CONTENT_TYPE = "application/pdf";
    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

    private final DocumentRepository        documentRepository;
    private final UserRepository            userRepository;
    private final FileStorageService        fileStorageService;
    private final DocumentProcessingService documentProcessingService;
    private final RagService                ragService;

    public DocumentService(DocumentRepository documentRepository,
                           UserRepository userRepository,
                           FileStorageService fileStorageService,
                           DocumentProcessingService documentProcessingService,
                           RagService ragService) {
        this.documentRepository        = documentRepository;
        this.userRepository            = userRepository;
        this.fileStorageService        = fileStorageService;
        this.documentProcessingService = documentProcessingService;
        this.ragService                = ragService;
    }

    /**
     * Upload a new PDF document for the authenticated user, then trigger
     * PDF text and metadata extraction automatically.
     */
    @Transactional
    public DocumentDto upload(MultipartFile file, String userEmail) {
        // Validate file
        validateFile(file);

        // Resolve user
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + userEmail));

        // Generate UUID-based stored filename
        String originalFileName = file.getOriginalFilename() != null
                ? file.getOriginalFilename()
                : "unnamed.pdf";
        String extension = originalFileName.contains(".")
                ? originalFileName.substring(originalFileName.lastIndexOf('.'))
                : ".pdf";
        String storedFileName = UUID.randomUUID() + extension;

        // Store file on disk
        fileStorageService.store(file, storedFileName);

        // Persist metadata
        DocumentEntity entity = new DocumentEntity(
                originalFileName,
                storedFileName,
                file.getSize(),
                file.getContentType(),
                "UPLOADED",
                user
        );
        entity = documentRepository.save(entity);

        log.info("Document uploaded: '{}' by user '{}' (id={})",
                originalFileName, userEmail, entity.getId());

        // Trigger PDF processing — runs synchronously in this phase.
        // To make it async in the next milestone, simply add @Async to
        // DocumentProcessingService.process() and @EnableAsync on the application class.
        documentProcessingService.process(entity.getId());

        // Re-fetch after processing so the returned DTO reflects extraction results
        entity = documentRepository.findById(entity.getId()).orElse(entity);

        return toDto(entity);
    }

    /**
     * List all documents belonging to the authenticated user.
     */
    @Transactional(readOnly = true)
    public List<DocumentDto> listByUser(String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        return documentRepository.findByUserIdOrderByUploadedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Get a single document by ID, ensuring it belongs to the authenticated user.
     */
    @Transactional(readOnly = true)
    public DocumentDto getByIdAndUser(Long documentId, String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        DocumentEntity entity = documentRepository.findByIdAndUserId(documentId, user.getId())
                .orElseThrow(() -> new DocumentNotFoundException(documentId));

        return toDto(entity);
    }

    /**
     * Delete a document by ID, ensuring it belongs to the authenticated user.
     * Removes both the file from disk and the database record.
     */
    @Transactional
    public void delete(Long documentId, String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        DocumentEntity entity = documentRepository.findByIdAndUserId(documentId, user.getId())
                .orElseThrow(() -> new DocumentNotFoundException(documentId));

        // Delete file from disk
        fileStorageService.delete(entity.getStoredFileName());

        // Delete associated vector embeddings from pgvector
        ragService.deleteDocumentVectors(documentId);

        // Delete database record
        documentRepository.delete(entity);

        log.info("Document deleted: id={}, '{}' by user '{}'",
                documentId, entity.getOriginalFileName(), userEmail);
    }

    /**
     * Resolve the file path for a document, ensuring it belongs to the authenticated user.
     * Used for serving the PDF file for download/view.
     */
    @Transactional(readOnly = true)
    public Path resolveFilePath(Long documentId, String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        DocumentEntity entity = documentRepository.findByIdAndUserId(documentId, user.getId())
                .orElseThrow(() -> new DocumentNotFoundException(documentId));

        return fileStorageService.resolve(entity.getStoredFileName());
    }

    /**
     * Get the content type for a document.
     */
    @Transactional(readOnly = true)
    public String getContentType(Long documentId, String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        DocumentEntity entity = documentRepository.findByIdAndUserId(documentId, user.getId())
                .orElseThrow(() -> new DocumentNotFoundException(documentId));

        return entity.getContentType();
    }

    /**
     * Returns the extracted text for a document.
     * Used by GET /api/v1/documents/{id}/text
     */
    @Transactional(readOnly = true)
    public DocumentTextResponse getTextByIdAndUser(Long documentId, String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        DocumentEntity entity = documentRepository.findByIdAndUserId(documentId, user.getId())
                .orElseThrow(() -> new DocumentNotFoundException(documentId));

        return new DocumentTextResponse(
                entity.getId(),
                entity.getProcessingStatus(),
                entity.getExtractedText()
        );
    }

    /**
     * Returns PDF metadata (no extracted text) for a document.
     * Used by GET /api/v1/documents/{id}/metadata
     */
    @Transactional(readOnly = true)
    public DocumentMetadataResponse getMetadataByIdAndUser(Long documentId, String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        DocumentEntity entity = documentRepository.findByIdAndUserId(documentId, user.getId())
                .orElseThrow(() -> new DocumentNotFoundException(documentId));

        return new DocumentMetadataResponse(
                entity.getId(),
                entity.getProcessingStatus(),
                entity.getPageCount(),
                entity.getPdfTitle(),
                entity.getPdfAuthor(),
                entity.getPdfCreationDate(),
                entity.getProcessedAt()
        );
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is empty. Please upload a valid PDF file.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase(ALLOWED_CONTENT_TYPE)) {
            throw new InvalidFileException(
                    "Only PDF files are allowed. Received: " + (contentType != null ? contentType : "unknown"));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException(
                    "File size exceeds the maximum allowed size of 20 MB. Received: "
                            + String.format("%.1f MB", file.getSize() / (1024.0 * 1024.0)));
        }

        String originalName = file.getOriginalFilename();
        if (originalName != null && !originalName.toLowerCase().endsWith(".pdf")) {
            throw new InvalidFileException("Only PDF files are allowed. File must have a .pdf extension.");
        }
    }

    private DocumentDto toDto(DocumentEntity entity) {
        return new DocumentDto(
                entity.getId(),
                entity.getOriginalFileName(),
                entity.getFileSize(),
                entity.getContentType(),
                entity.getStatus(),
                entity.getUploadedAt(),
                entity.getProcessingStatus(),
                entity.getPageCount(),
                entity.getPdfTitle(),
                entity.getPdfAuthor(),
                entity.getPdfCreationDate(),
                entity.getExtractedText(),
                entity.getProcessedAt()
        );
    }
}
