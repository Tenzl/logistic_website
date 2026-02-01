package com.example.seatrans.shared.security;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.seatrans.features.auth.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;

/**
 * JWT Token Provider Implementation
 * Handles JWT token generation, validation, and parsing
 */
@Component
public class JwtTokenProvider implements TokenProvider {
    
    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private static final String CLAIM_ROLES = "roles";
    
    @Value("${app.jwt.secret:}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration:86400000}") // 24 hours default
    private long jwtExpirationMs;
    
    @Value("${app.jwt.refresh-expiration:604800000}") // 7 days default
    private long refreshExpirationMs;
    
    private byte[] secretKey;
    
    @PostConstruct
    public void init() {
        // Ensure secret is configured and at least 256 bits (32 bytes)
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("JWT secret is not configured. Set APP_JWT_SECRET or app.jwt.secret.");
        }

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
    public String generateToken(Long userId, String email) {
        return generateToken(userId, email, jwtExpirationMs, null);
    }

    /**
     * Generate Refresh Token
     */
    public String generateRefreshToken(Long userId, String email) {
        return generateToken(userId, email, refreshExpirationMs, null);
    }

    /**
     * Generate JWT token embedding role name for authorization.
     */
    @Override
    public String generateToken(User user) {
        String roleName = user.getRole() != null
            ? user.getRole().getName()
            : null;
        return generateToken(user.getId(), user.getEmail(), jwtExpirationMs, roleName);
    }

    @Override
    public String generateRefreshToken(User user) {
        String roleName = user.getRole() != null
            ? user.getRole().getName()
            : null;
        return generateToken(user.getId(), user.getEmail(), refreshExpirationMs, roleName);
    }

        private String generateToken(Long userId, String email, long expirationMs, String roleName) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);
        
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
            .claim(CLAIM_ROLES, roleName)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(Keys.hmacShaKeyFor(secretKey), SignatureAlgorithm.HS512)
                .compact();
    }
    
    /**
     * Get email from JWT token
     */
    @Override
    public String getEmailFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.getSubject();
    }
    
    /**
     * Get userId from JWT token
     */
    @Override
    public Long getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.get("userId", Long.class);
    }

    /**
     * Extract role name embedded in JWT (may be null for legacy tokens).
     */
    @Override
    public String getRoleFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.get(CLAIM_ROLES, String.class);
    }
    
    /**
     * Validate JWT token
     */
    @Override
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(secretKey))
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SignatureException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
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
