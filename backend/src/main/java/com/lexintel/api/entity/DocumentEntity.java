package com.lexintel.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false, unique = true)
    private String storedFileName;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false)
    private String contentType;

    /** Upload-level status — kept for backward compatibility. */
    @Column(nullable = false)
    private String status;

    /** Processing pipeline status: UPLOADED | PROCESSING | PROCESSED | FAILED */
    @Column(nullable = false)
    private String processingStatus = "UPLOADED";

    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    // ─── PDF extraction fields (nullable until processing completes) ──────────

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    private Integer pageCount;

    private String pdfTitle;

    private String pdfAuthor;

    private String pdfCreationDate;

    private LocalDateTime processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ChatMessageEntity> chatMessages;

    public DocumentEntity() {}

    public DocumentEntity(String originalFileName, String storedFileName,
                          Long fileSize, String contentType,
                          String status, UserEntity user) {
        this.originalFileName = originalFileName;
        this.storedFileName   = storedFileName;
        this.fileSize         = fileSize;
        this.contentType      = contentType;
        this.status           = status;
        this.processingStatus = "UPLOADED";
        this.user             = user;
    }

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }

    // ─── Getters and Setters ─────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getStoredFileName() { return storedFileName; }
    public void setStoredFileName(String storedFileName) { this.storedFileName = storedFileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getProcessingStatus() { return processingStatus; }
    public void setProcessingStatus(String processingStatus) { this.processingStatus = processingStatus; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }

    public String getPdfTitle() { return pdfTitle; }
    public void setPdfTitle(String pdfTitle) { this.pdfTitle = pdfTitle; }

    public String getPdfAuthor() { return pdfAuthor; }
    public void setPdfAuthor(String pdfAuthor) { this.pdfAuthor = pdfAuthor; }

    public String getPdfCreationDate() { return pdfCreationDate; }
    public void setPdfCreationDate(String pdfCreationDate) { this.pdfCreationDate = pdfCreationDate; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }
}
