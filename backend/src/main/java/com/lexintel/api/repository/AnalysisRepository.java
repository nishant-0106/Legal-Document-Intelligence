package com.lexintel.api.repository;

import com.lexintel.api.entity.AnalysisEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalysisRepository extends JpaRepository<AnalysisEntity, Long> {
    Optional<AnalysisEntity> findByDocumentId(Long documentId);
}
