package com.example.seatrans.features.auth.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.auth.dto.AuthResponseDTO;
import com.example.seatrans.features.auth.dto.LoginDTO;
import com.example.seatrans.features.auth.dto.RefreshTokenRequest;
import com.example.seatrans.features.auth.dto.RegisterDTO;
import com.example.seatrans.features.auth.dto.UserDTO;
import com.example.seatrans.features.auth.service.AuthService;
import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.shared.exception.DuplicateUserException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Controller xử lý authentication (đăng ký, đăng nhập)
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {
    private final AuthService authService;

    /**
     * POST /api/v1/auth/register/customer
     * Đăng ký customer mới (ROLE_CUSTOMER) - trả về JWT token
     */
    @PostMapping("/register/customer")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> registerCustomer(
            @Valid @RequestBody RegisterDTO registerDTO) {
        try {
            AuthResponseDTO authResponse = authService.register(registerDTO);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Customer registered successfully", authResponse));
        } catch (DuplicateUserException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Email already in use. Please log in."));
        }
    }

    /**
     * POST /api/auth/login
     * Đăng nhập - trả về JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(
        @Valid @RequestBody LoginDTO loginDTO) {
        AuthResponseDTO authResponse = authService.login(loginDTO);
        if (authResponse == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password"));
        }

        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    /**
     * POST /api/auth/refresh-token
     * Cấp lại access token mới từ refresh token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> refreshToken(
        @Valid @RequestBody RefreshTokenRequest request) {
        AuthResponseDTO authResponse = authService.refreshToken(request);
        if (authResponse == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid refresh token"));
        }

        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authResponse));
    }

    /**
     * POST /api/auth/logout
     * Đăng xuất (client removes token)
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

    /**
     * GET /api/auth/current-user
     * Lấy thông tin user hiện tại từ JWT token
     */
    @GetMapping("/current-user")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Missing or invalid Authorization header"));
        }

        try {
            String token = authHeader.substring(7);
            UserDTO userDTO = authService.getCurrentUser(token);
            return ResponseEntity.ok(ApiResponse.success("Current user fetched successfully", userDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid or expired token"));
        }
    }
}


