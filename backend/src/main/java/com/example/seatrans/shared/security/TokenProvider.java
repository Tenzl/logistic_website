package com.example.seatrans.shared.security;

import java.util.List;

import com.example.seatrans.features.auth.model.User;

/**
 * Token Provider Interface
 * Abstracts token generation and validation logic
 * Allows easy swapping between JWT, OAuth2, or other token mechanisms
 */
public interface TokenProvider {
    
    /**
     * Generate access token for user
     * @param user User entity with roles
     * @return Token string
     */
    String generateToken(User user);
    
    /**
     * Generate refresh token for user
     * @param user User entity with roles
     * @return Refresh token string
     */
    String generateRefreshToken(User user);
    
    /**
     * Validate token signature and expiration
     * @param token Token string
     * @return true if valid, false otherwise
     */
    boolean validateToken(String token);
    
    /**
     * Extract email from token
     * @param token Token string
     * @return Email subject
     */
    String getEmailFromToken(String token);
    
    /**
     * Extract user ID from token
     * @param token Token string
     * @return User ID
     */
    Long getUserIdFromToken(String token);
    
    /**
     * Extract roles from token
     * @param token Token string
     * @return List of role names
     */
    List<String> getRolesFromToken(String token);
}
