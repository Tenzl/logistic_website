package com.example.seatrans.features.auth.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.seatrans.features.auth.dto.UserDTO;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.service.UserService;
import com.example.seatrans.shared.mapper.EntityMapper;
import com.example.seatrans.shared.security.TokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for OAuth2 authentication (Google login)
 */
@RestController
@RequestMapping("/api/v1/auth/oauth2")
@RequiredArgsConstructor
@Slf4j
public class OAuth2Controller {
    
    private final UserService userService;
    private final EntityMapper entityMapper;
    private final TokenProvider tokenProvider;
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;
    
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;
    
    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String redirectUri;
    
    /**
     * Initiate Google OAuth2 login
     * GET /api/auth/oauth2/google
     */
    @GetMapping("/google")
    public ResponseEntity<Map<String, String>> initiateGoogleLogin() {
        String authUrl = String.format(
            "https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=profile email",
            googleClientId,
            redirectUri
        );
        
        return ResponseEntity.ok(Map.of("authUrl", authUrl));
    }
    
    /**
     * Handle OAuth2 callback from Google
     * GET /api/auth/oauth2/callback/google?code=...
     */
    @GetMapping("/callback/google")
    public ResponseEntity<String> handleGoogleCallback(@RequestParam String code) {
        try {
            // Exchange authorization code for access token
            String tokenEndpoint = "https://oauth2.googleapis.com/token";
            
            Map<String, String> tokenRequest = Map.of(
                "code", code,
                "client_id", googleClientId,
                "client_secret", googleClientSecret,
                "redirect_uri", redirectUri,
                "grant_type", "authorization_code"
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Type", "application/x-www-form-urlencoded");
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(tokenRequest, headers);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> tokenResponse = restTemplate.postForObject(
                tokenEndpoint,
                tokenRequest,
                Map.class
            );
            
            String accessToken = (String) tokenResponse.get("access_token");
            
            // Get user info from Google
            String userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.setBearerAuth(accessToken);
            
            HttpEntity<Void> userInfoRequest = new HttpEntity<>(userInfoHeaders);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> userInfo = restTemplate.exchange(
                userInfoEndpoint,
                HttpMethod.GET,
                userInfoRequest,
                Map.class
            ).getBody();
            
            // Extract user information
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String googleId = (String) userInfo.get("sub");
            
            // Find or create user
            User user = userService.findOrCreateOAuthUser(email, name, "google", googleId);
            
            // Generate JWT tokens
            String jwtToken = tokenProvider.generateToken(user);
            String refreshToken = tokenProvider.generateRefreshToken(user);
            
            UserDTO userDTO = entityMapper.toUserDTO(user);
            
            // Redirect to frontend with tokens
            String frontendBase = System.getenv().getOrDefault("FRONTEND_BASE_URL", "http://localhost:3000");
            String frontendUrl = String.format(
                "%s/auth/callback?token=%s&refreshToken=%s",
                frontendBase,
                jwtToken,
                refreshToken
            );
            
            return ResponseEntity
                .status(HttpStatus.FOUND)
                .header("Location", frontendUrl)
                .body("Redirecting to frontend...");
                
        } catch (Exception e) {
            log.error("OAuth2 callback error", e);
            String frontendBase = System.getenv().getOrDefault("FRONTEND_BASE_URL", "http://localhost:3000");
            return ResponseEntity
                .status(HttpStatus.FOUND)
                .header("Location", frontendBase + "/login?error=oauth_failed")
                .body("Authentication failed");
        }
    }
}
