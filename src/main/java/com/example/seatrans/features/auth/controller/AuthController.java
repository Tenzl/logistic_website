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
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.service.UserService;
import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.shared.exception.DuplicateUserException;
import com.example.seatrans.shared.mapper.EntityMapper;
import com.example.seatrans.shared.security.TokenProvider;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Controller xá»­ lÃ½ authentication (Ä‘Äƒng kÃ½, Ä‘Äƒng nháº­p)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {
    private final UserService userService;
    private final EntityMapper entityMapper;
    private final TokenProvider tokenProvider;

    /**
     * POST /api/auth/register/customer
     * Đăng ký customer mới (ROLE_CUSTOMER) - trả về JWT token
     */
    @PostMapping("/register/customer")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> registerCustomer(
            @Valid @RequestBody RegisterDTO registerDTO) {
        try {
            User createdUser = userService.registerOrUpgradeCustomer(registerDTO);

            UserDTO userDTO = entityMapper.toUserDTO(createdUser);

            String token = tokenProvider.generateToken(createdUser);
            String refreshToken = tokenProvider.generateRefreshToken(createdUser);

            AuthResponseDTO authResponse = AuthResponseDTO.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .type("Bearer")
                    .user(userDTO)
                    .build();

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
        boolean isValid = userService.verifyCredentials(loginDTO.getEmail(), loginDTO.getPassword());

        if (!isValid) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid email or password"));
        }

        User user = userService.getUserByEmail(loginDTO.getEmail());
        userService.updateLastLogin(user.getId());

        UserDTO userDTO = entityMapper.toUserDTO(user);

        String token = tokenProvider.generateToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        AuthResponseDTO authResponse = AuthResponseDTO.builder()
                .token(token)
                .refreshToken(refreshToken)
                .type("Bearer")
                .user(userDTO)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    /**
     * POST /api/auth/refresh-token
     * Cấp lại access token mới từ refresh token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {

        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateToken(refreshToken)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid or expired refresh token"));
        }

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userService.getUserById(userId);

        String newToken = tokenProvider.generateToken(user);
        String newRefreshToken = tokenProvider.generateRefreshToken(user);

        UserDTO userDTO = entityMapper.toUserDTO(user);

        AuthResponseDTO authResponse = AuthResponseDTO.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .type("Bearer")
                .user(userDTO)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authResponse));
    }

    /**
     * POST /api/auth/logout
     * Đăng xuất (JWT token bị vô hiệu hóa trên client)
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
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

        String token = authHeader.substring(7);
        if (!tokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid or expired token"));
        }

        Long userId = tokenProvider.getUserIdFromToken(token);
        User user = userService.getUserById(userId);
        UserDTO userDTO = entityMapper.toUserDTO(user);

        return ResponseEntity.ok(ApiResponse.success("Current user fetched successfully", userDTO));
    }
}


