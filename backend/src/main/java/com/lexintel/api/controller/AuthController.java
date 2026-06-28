package com.lexintel.api.controller;

import com.lexintel.api.dto.AuthResponse;
import com.lexintel.api.dto.LoginRequest;
import com.lexintel.api.dto.RegisterRequest;
import com.lexintel.api.dto.UserDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private static class RegisteredUser {
        final UserDto user;
        final String password;

        RegisteredUser(UserDto user, String password) {
            this.user = user;
            this.password = password;
        }
    }

    private static final ConcurrentHashMap<String, RegisteredUser> users = new ConcurrentHashMap<>();

    static {
        // Pre-populate with default mock users
        users.put("alex@techcorp.com", new RegisteredUser(
                new UserDto(1L, "Alex Chen", "alex@techcorp.com", "Senior Legal Counsel", "TechCorp Inc.", null),
                "password"
        ));
        users.put("demo@lexintel.ai", new RegisteredUser(
                new UserDto(2L, "Demo User", "demo@lexintel.ai", "Senior Legal Counsel", "TechCorp Inc.", null),
                "demo123"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.email() == null || request.email().isBlank() ||
            request.password() == null || request.password().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Email and password are required");
        }

        String emailKey = request.email().toLowerCase().trim();
        RegisteredUser registered = users.get(emailKey);
        if (registered != null && registered.password.equals(request.password())) {
            String token = "mock_jwt_token_" + System.currentTimeMillis();
            return ResponseEntity.ok(new AuthResponse(token, registered.user));
        }

        // Invalid credentials rejection
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid email or password");
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

        String emailKey = request.email().toLowerCase().trim();
        if (users.containsKey(emailKey)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email is already registered");
        }

        // Mock registration logic
        UserDto user = new UserDto(
                System.currentTimeMillis(),
                request.firstName() + " " + request.lastName(),
                request.email(),
                "Legal Counsel",
                "Self Employed",
                null
        );
        
        users.put(emailKey, new RegisteredUser(user, request.password()));

        String token = "mock_jwt_token_" + System.currentTimeMillis();
        return ResponseEntity.ok(new AuthResponse(token, user));
    }
}


