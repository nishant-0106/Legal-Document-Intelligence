package com.lexintel.api.dto;

public record AuthResponse(
    String token,
    UserDto user
) {}
