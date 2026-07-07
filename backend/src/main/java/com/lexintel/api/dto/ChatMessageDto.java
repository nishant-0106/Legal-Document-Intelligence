package com.lexintel.api.dto;

import java.time.LocalDateTime;

public record ChatMessageDto(
        Long id,
        String role,
        String text,
        LocalDateTime timestamp
) {}
