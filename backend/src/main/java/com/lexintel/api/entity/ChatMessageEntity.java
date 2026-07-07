package com.lexintel.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private DocumentEntity document;

    @Column(nullable = false)
    private String role; // "user" or "ai"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public ChatMessageEntity() {}

    public ChatMessageEntity(DocumentEntity document, String role, String text) {
        this.document = document;
        this.role = role;
        this.text = text;
        this.timestamp = LocalDateTime.now();
    }

    // ─── Getters and Setters ─────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DocumentEntity getDocument() { return document; }
    public void setDocument(DocumentEntity document) { this.document = document; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
