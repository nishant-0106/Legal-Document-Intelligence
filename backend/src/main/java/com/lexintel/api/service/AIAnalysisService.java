package com.lexintel.api.service;

import com.lexintel.api.dto.GeminiAnalysisResult;
import com.lexintel.api.exception.GeminiApiException;
import com.lexintel.api.exception.GeminiRateLimitException;
import com.lexintel.api.exception.GeminiTimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AIAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AIAnalysisService.class);

    private final ChatClient chatClient;

    public AIAnalysisService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public GeminiAnalysisResult analyzeText(String documentText) {
        if (documentText == null || documentText.isBlank()) {
            throw new IllegalArgumentException("Document text cannot be null or empty.");
        }

        String prompt = "You are a professional legal assistant. Analyze the following legal document and extract details matching the requested schema.\n\n" +
                "Here is the legal document text:\n" +
                documentText;

        log.info("Sending document analysis request to Gemini via Spring AI (text size={} chars)...", documentText.length());

        try {
            GeminiAnalysisResult result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .entity(GeminiAnalysisResult.class);

            if (result == null) {
                log.error("Received null response from Gemini via Spring AI.");
                throw new RuntimeException("Received empty response from Gemini API.");
            }

            return result;

        } catch (Exception ex) {
            log.error("Error during Spring AI Gemini API call: {}", ex.getMessage(), ex);
            String msg = ex.getMessage();
            if (msg != null && (msg.contains("429") || msg.toLowerCase().contains("rate limit"))) {
                throw new GeminiRateLimitException("Gemini API rate limit exceeded. Please try again later.", ex);
            } else if (msg != null && (msg.contains("timeout") || msg.toLowerCase().contains("timed out"))) {
                throw new GeminiTimeoutException("Gemini API request timed out. The document might be too complex or the network is slow.", ex);
            }
            throw new GeminiApiException("Unexpected error during Gemini API call: " + ex.getMessage(), ex);
        }
    }
}
