package com.lexintel.api.controller;

import com.lexintel.api.dto.ChatMessageDto;
import com.lexintel.api.dto.ChatRequest;
import com.lexintel.api.entity.ChatMessageEntity;
import com.lexintel.api.entity.DocumentEntity;
import com.lexintel.api.entity.UserEntity;
import com.lexintel.api.exception.DocumentNotFoundException;
import com.lexintel.api.repository.ChatMessageRepository;
import com.lexintel.api.repository.DocumentRepository;
import com.lexintel.api.repository.UserRepository;
import com.lexintel.api.service.RagService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final ChatMessageRepository chatMessageRepository;
    private final DocumentRepository    documentRepository;
    private final UserRepository        userRepository;
    private final RagService            ragService;

    public ChatController(ChatMessageRepository chatMessageRepository,
                          DocumentRepository documentRepository,
                          UserRepository userRepository,
                          RagService ragService) {
        this.chatMessageRepository = chatMessageRepository;
        this.documentRepository    = documentRepository;
        this.userRepository        = userRepository;
        this.ragService            = ragService;
    }

    /**
     * Sends a chat question about a document, performs vector search RAG,
     * calls Gemini, saves user & AI messages in history, and returns the response.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<ChatMessageDto> sendMessage(
            @RequestBody ChatRequest request,
            Authentication authentication) {

        String email = (String) authentication.getPrincipal();
        log.info("Chat message request from user '{}' for document id={}", email, request.documentId());

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));

        // Validate document ownership
        DocumentEntity document = documentRepository.findByIdAndUserId(request.documentId(), user.getId())
                .orElseThrow(() -> new DocumentNotFoundException(request.documentId()));

        // 1. Save User's question in chat history
        ChatMessageEntity userMsg = new ChatMessageEntity(document, "user", request.message());
        chatMessageRepository.save(userMsg);

        // 2. Perform Retrieval-Augmented Generation (RAG) to generate answer
        String aiAnswer = ragService.retrieveContextAndAnswer(document, request.message());

        // 3. Save AI's response in chat history
        ChatMessageEntity aiMsg = new ChatMessageEntity(document, "ai", aiAnswer);
        aiMsg = chatMessageRepository.save(aiMsg);

        log.info("Generated answer for document id={} from Gemini (chars={}).",
                request.documentId(), aiMsg.getText().length());

        return ResponseEntity.ok(new ChatMessageDto(
                aiMsg.getId(),
                aiMsg.getRole(),
                aiMsg.getText(),
                aiMsg.getTimestamp()
        ));
    }

    /**
     * Loads the complete chat history for a specific document, secured by ownership.
     */
    @GetMapping("/history/{documentId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ChatMessageDto>> getHistory(
            @PathVariable Long documentId,
            Authentication authentication) {

        String email = (String) authentication.getPrincipal();
        log.info("Request from '{}' to get chat history for document id={}", email, documentId);

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));

        // Validate document ownership
        DocumentEntity document = documentRepository.findByIdAndUserId(documentId, user.getId())
                .orElseThrow(() -> new DocumentNotFoundException(documentId));

        List<ChatMessageDto> history = chatMessageRepository.findByDocumentIdOrderByTimestampAsc(document.getId())
                .stream()
                .map(msg -> new ChatMessageDto(
                        msg.getId(),
                        msg.getRole(),
                        msg.getText(),
                        msg.getTimestamp()
                ))
                .toList();

        return ResponseEntity.ok(history);
    }
}
