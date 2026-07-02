package com.lexintel.api.controller;

import com.lexintel.api.dto.AuthResponse;
import com.lexintel.api.dto.LoginRequest;
import com.lexintel.api.dto.RegisterRequest;
import com.lexintel.api.dto.UserDto;
import com.lexintel.api.entity.UserEntity;
import com.lexintel.api.repository.UserRepository;
import com.lexintel.api.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.email() == null || request.email().isBlank() ||
            request.password() == null || request.password().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Email and password are required");
        }

        String emailKey = request.email().toLowerCase().trim();
        return userRepository.findByEmail(emailKey)
                .filter(user -> passwordEncoder.matches(request.password(), user.getHashedPassword()))
                .map(user -> {
                    String token = jwtUtil.generateToken(emailKey);
                    return ResponseEntity.ok((Object) new AuthResponse(token, toDto(user)));
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid email or password"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.email() == null || request.email().isBlank() ||
            request.password() == null || request.password().isBlank() ||
            request.firstName() == null || request.firstName().isBlank() ||
            request.lastName() == null || request.lastName().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("First name, last name, email, and password are required");
        }

        if (request.password().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Password must be at least 6 characters");
        }

        String emailKey = request.email().toLowerCase().trim();
        if (userRepository.existsByEmail(emailKey)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email is already registered");
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        String fullName = request.firstName().trim() + " " + request.lastName().trim();

        UserEntity entity = new UserEntity(fullName, emailKey, hashedPassword, "Legal Counsel", "Self Employed");
        entity = userRepository.save(entity);

        String token = jwtUtil.generateToken(emailKey);
        return ResponseEntity.ok(new AuthResponse(token, toDto(entity)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        String email = (String) authentication.getPrincipal();
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok((Object) toDto(user)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"));
    }

    private UserDto toDto(UserEntity entity) {
        return new UserDto(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getRole(),
                entity.getCompany(),
                entity.getAvatar()
        );
    }
}
