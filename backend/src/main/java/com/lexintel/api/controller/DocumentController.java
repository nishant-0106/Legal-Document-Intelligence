package com.lexintel.api.controller;

import com.lexintel.api.dto.DocumentDto;
import com.lexintel.api.dto.DocumentUploadResponse;
import com.lexintel.api.service.DocumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Upload a PDF document.
     */
    @PostMapping("/upload")
    public ResponseEntity<DocumentUploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String email = (String) authentication.getPrincipal();
        log.info("Upload request from user '{}': file='{}', size={} bytes",
                email, file.getOriginalFilename(), file.getSize());

        DocumentDto doc = documentService.upload(file, email);

        return ResponseEntity.ok(new DocumentUploadResponse("Document uploaded successfully", doc));
    }

    /**
     * List all documents for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<DocumentDto>> list(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        List<DocumentDto> documents = documentService.listByUser(email);
        return ResponseEntity.ok(documents);
    }

    /**
     * Get a single document by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getById(
            @PathVariable Long id,
            Authentication authentication) {

        String email = (String) authentication.getPrincipal();
        DocumentDto doc = documentService.getByIdAndUser(id, email);
        return ResponseEntity.ok(doc);
    }

    /**
     * Delete a document by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(
            @PathVariable Long id,
            Authentication authentication) {

        String email = (String) authentication.getPrincipal();
        documentService.delete(id, email);
        return ResponseEntity.ok(Map.of("success", true, "message", "Document deleted successfully"));
    }

    /**
     * Download / view a PDF document.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long id,
            Authentication authentication) throws MalformedURLException {

        String email = (String) authentication.getPrincipal();
        Path filePath = documentService.resolveFilePath(id, email);
        String contentType = documentService.getContentType(id, email);

        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/pdf"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
