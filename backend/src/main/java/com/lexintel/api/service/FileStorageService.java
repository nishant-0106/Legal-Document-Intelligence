package com.lexintel.api.service;

import com.lexintel.api.exception.FileStorageException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Handles low-level filesystem operations for uploaded documents.
 * Separated from DocumentService so it can be swapped for S3, GCS, etc. in future.
 */
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final Path uploadDir;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadDir);
            log.info("Upload directory initialized: {}", uploadDir);
        } catch (IOException e) {
            throw new FileStorageException("Could not create upload directory: " + uploadDir, e);
        }
    }

    /**
     * Store a file on disk with the given stored filename.
     */
    public void store(MultipartFile file, String storedFileName) {
        try {
            Path target = uploadDir.resolve(storedFileName).normalize();

            // Security: prevent path traversal
            if (!target.getParent().equals(uploadDir)) {
                throw new FileStorageException("Cannot store file outside upload directory");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            log.info("Stored file: {} ({} bytes)", storedFileName, file.getSize());
        } catch (IOException e) {
            throw new FileStorageException("Failed to store file: " + storedFileName, e);
        }
    }

    /**
     * Delete a stored file from disk.
     */
    public void delete(String storedFileName) {
        try {
            Path target = uploadDir.resolve(storedFileName).normalize();
            if (Files.exists(target)) {
                Files.delete(target);
                log.info("Deleted file: {}", storedFileName);
            } else {
                log.warn("File not found for deletion: {}", storedFileName);
            }
        } catch (IOException e) {
            throw new FileStorageException("Failed to delete file: " + storedFileName, e);
        }
    }

    /**
     * Resolve the full path for a stored file.
     */
    public Path resolve(String storedFileName) {
        return uploadDir.resolve(storedFileName).normalize();
    }
}
