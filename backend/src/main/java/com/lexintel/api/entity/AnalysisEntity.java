package com.lexintel.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analyses")
public class AnalysisEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private DocumentEntity document;

    @Column(nullable = false)
    private String documentType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false)
    private Integer riskScore;

    @Column(nullable = false)
    private String overallRisk;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String keyClausesJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String missingClausesJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String recommendationsJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String importantDatesJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String partiesJson;

    @Column(nullable = false)
    private LocalDateTime analyzedAt;

    public AnalysisEntity() {}

    public AnalysisEntity(DocumentEntity document, String documentType, String summary,
                          Integer riskScore, String overallRisk, String keyClausesJson,
                          String missingClausesJson, String recommendationsJson,
                          String importantDatesJson, String partiesJson) {
        this.document = document;
        this.documentType = documentType;
        this.summary = summary;
        this.riskScore = riskScore;
        this.overallRisk = overallRisk;
        this.keyClausesJson = keyClausesJson;
        this.missingClausesJson = missingClausesJson;
        this.recommendationsJson = recommendationsJson;
        this.importantDatesJson = importantDatesJson;
        this.partiesJson = partiesJson;
        this.analyzedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.analyzedAt == null) {
            this.analyzedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DocumentEntity getDocument() {
        return document;
    }

    public void setDocument(DocumentEntity document) {
        this.document = document;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }

    public String getOverallRisk() {
        return overallRisk;
    }

    public void setOverallRisk(String overallRisk) {
        this.overallRisk = overallRisk;
    }

    public String getKeyClausesJson() {
        return keyClausesJson;
    }

    public void setKeyClausesJson(String keyClausesJson) {
        this.keyClausesJson = keyClausesJson;
    }

    public String getMissingClausesJson() {
        return missingClausesJson;
    }

    public void setMissingClausesJson(String missingClausesJson) {
        this.missingClausesJson = missingClausesJson;
    }

    public String getRecommendationsJson() {
        return recommendationsJson;
    }

    public void setRecommendationsJson(String recommendationsJson) {
        this.recommendationsJson = recommendationsJson;
    }

    public String getImportantDatesJson() {
        return importantDatesJson;
    }

    public void setImportantDatesJson(String importantDatesJson) {
        this.importantDatesJson = importantDatesJson;
    }

    public String getPartiesJson() {
        return partiesJson;
    }

    public void setPartiesJson(String partiesJson) {
        this.partiesJson = partiesJson;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
}
