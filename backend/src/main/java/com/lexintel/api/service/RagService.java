package com.lexintel.api.service;

import com.lexintel.api.entity.DocumentEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RagService {

    private static final Logger log = LoggerFactory.getLogger(RagService.class);

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;

    public RagService(ChatClient.Builder chatClientBuilder, VectorStore vectorStore, JdbcTemplate jdbcTemplate) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Splits document text into overlapping chunks, generates embeddings, and saves them to the pgvector store.
     */
    @Transactional
    public void chunkAndEmbed(DocumentEntity document) {
        String text = document.getExtractedText();
        if (text == null || text.isBlank()) {
            log.warn("Document id={} has no text to chunk and embed.", document.getId());
            return;
        }

        log.info("Starting semantic chunking for document id={} ('{}')...", document.getId(), document.getOriginalFileName());

        try {
            // Split document into semantic chunks using TokenTextSplitter (800 tokens chunk, 100 tokens overlap)
            TokenTextSplitter splitter = new TokenTextSplitter(800, 100, 10, 10000, true);
            List<Document> chunks = splitter.split(new Document(text));

            // Populate metadata mapping back to the parent document
            List<Document> documentsToStore = chunks.stream()
                    .map(chunk -> {
                        Map<String, Object> metadata = new HashMap<>(chunk.getMetadata());
                        metadata.put("documentId", document.getId());
                        metadata.put("fileName", document.getOriginalFileName());
                        return new Document(chunk.getId(), chunk.getText(), metadata);
                    })
                    .toList();

            log.info("Generating embeddings and saving {} chunks to pgvector store for document id={}...",
                    documentsToStore.size(), document.getId());

            vectorStore.add(documentsToStore);

            log.info("Successfully vectorized and stored chunks for document id={}.", document.getId());

        } catch (Exception e) {
            log.error("Failed to chunk and embed document id={}: {}", document.getId(), e.getMessage(), e);
            throw new RuntimeException("Vector storage operation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves the most relevant chunks using vector similarity filtered by document ID,
     * and queries Gemini to generate a contextual answer.
     */
    @Transactional(readOnly = true)
    public String retrieveContextAndAnswer(DocumentEntity document, String question) {
        log.info("RAG search query for document id={}: '{}'", document.getId(), question);

        try {
            // Retrieve relevant chunks filtered by documentId
            SearchRequest searchRequest = SearchRequest.builder()
                    .query(question)
                    .topK(5)
                    .filterExpression("documentId == " + document.getId())
                    .build();

            List<Document> relevantChunks = vectorStore.similaritySearch(searchRequest);

            log.info("Retrieved {} relevant chunks from vector store for document id={}.",
                    relevantChunks.size(), document.getId());

            // Build context string from the retrieved chunks
            String context = relevantChunks.stream()
                    .map(Document::getText)
                    .collect(Collectors.joining("\n\n---\n\n"));

            if (context.isBlank()) {
                log.warn("No context chunks found in similarity search for document id={}.", document.getId());
                context = "No relevant context found in this document.";
            }

            // Construct system instructions and user query prompt
            String systemInstructions = "You are an expert AI legal assistant. Answer the user's question about the contract/document using ONLY the provided text snippets from the document. " +
                    "Be highly professional, precise, and objective. " +
                    "If the answer cannot be derived from the provided context chunks, explicitly state that the document does not contain enough information to answer the question, or that you do not know. " +
                    "Never hallucinate or use external general knowledge not supported by the document. " +
                    "Format your answer using clean markdown structure (headings, bullet points, bold text).\n\n" +
                    "Here is the context extracted from the document:\n" +
                    context;

            // Call Gemini using the autowired ChatClient
            GoogleGenAiChatOptions options = GoogleGenAiChatOptions.builder()
                    .build();

            String answer = chatClient.prompt()
                    .system(systemInstructions)
                    .user(question)
                    .options(options)
                    .call()
                    .content();

            if (answer == null) {
                throw new RuntimeException("Received empty response from Gemini chat model.");
            }

            return answer;

        } catch (Exception e) {
            log.error("Error during RAG pipeline execution for document id={}: {}", document.getId(), e.getMessage(), e);
            throw new RuntimeException("AI search failed: " + e.getMessage(), e);
        }
    }

    /**
     * Cleans up all vector chunks from the database table when a document is deleted.
     */
    @Transactional
    public void deleteDocumentVectors(Long documentId) {
        log.info("Deleting vector store embeddings for document id={}", documentId);
        try {
            int rowsDeleted = jdbcTemplate.update(
                    "DELETE FROM vector_store WHERE metadata->>'documentId' = ?",
                    String.valueOf(documentId)
            );
            log.info("Deleted {} chunks from vector_store table for document id={}.", rowsDeleted, documentId);
        } catch (Exception e) {
            log.error("Failed to delete vector embeddings for document id={}: {}", documentId, e.getMessage(), e);
        }
    }
}
