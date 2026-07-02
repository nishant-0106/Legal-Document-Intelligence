package com.lexintel.api.repository;

import com.lexintel.api.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {

    List<DocumentEntity> findByUserIdOrderByUploadedAtDesc(Long userId);

    Optional<DocumentEntity> findByIdAndUserId(Long id, Long userId);
}
