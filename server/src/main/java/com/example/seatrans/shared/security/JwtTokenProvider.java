package com.example.seatrans.shared.security;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

/**
 * JWT Token Provider
 * Xử lý tạo, validate, parse JWT token
 */
@Component
public class JwtTokenProvider {
    
    @Value("${app.jwt.secret:seatrans-secret-key-change-in-production-please-make-it-very-long-and-secure}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration:86400000}") // 24 hours default
    private long jwtExpirationMs;
    
    @Value("${app.jwt.refresh-expiration:604800000}") // 7 days default
    private long refreshExpirationMs;
    
    private byte[] secretKey;
    
    @PostConstruct
    public void init() {
        // Ensure secret is at least 256 bits (32 bytes)
        if (jwtSecret.length() < 32) {
            String paddedSecret = String.format("%-32s", jwtSecret).replace(' ', 'x');
            this.secretKey = paddedSecret.getBytes();
        } else {
            this.secretKey = jwtSecret.getBytes();
        }
    }
    
    /**
     * Generate JWT token
     */
    public String generateToken(Long userId, String username) {
        return generateToken(userId, username, jwtExpirationMs);
    }

    /**
     * Generate Refresh Token
     */
    public String generateRefreshToken(Long userId, String username) {
        return generateToken(userId, username, refreshExpirationMs);
    }

    private String generateToken(Long userId, String username, long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);
        
        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(Keys.hmacShaKeyFor(secretKey), SignatureAlgorithm.HS512)
                .compact();
    }
    
    /**
     * Get username from JWT token
     */
    public String getUsernameFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.getSubject();
    }
    
    /**
     * Get userId from JWT token
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.get("userId", Long.class);
    }
    
    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(secretKey))
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            System.err.println("JWT Validation Error: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Get all claims from token
     */
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(secretKey))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
}
