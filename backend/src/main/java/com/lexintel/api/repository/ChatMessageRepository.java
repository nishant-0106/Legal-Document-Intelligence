package com.lexintel.api.repository;

import com.lexintel.api.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

    List<ChatMessageEntity> findByDocumentIdOrderByTimestampAsc(Long documentId);

    void deleteByDocumentId(Long documentId);
}
