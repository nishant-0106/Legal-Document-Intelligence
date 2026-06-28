package com.lexintel.api.dto;

public record UserDto(
    Long id,
    String name,
    String email,
    String role,
    String company,
    String avatar
) {}
