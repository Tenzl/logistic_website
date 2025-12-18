package com.example.seatrans.shared.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * JWT Authentication Filter
 * Intercepts requests and validates JWT token
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        System.out.println("JwtAuthenticationFilter: Processing request to " + request.getRequestURI());
        
        try {
            // Get JWT token from Authorization header
            String token = getTokenFromRequest(request);
            
            System.out.println("JwtAuthenticationFilter: Token extracted = " + (token != null ? "YES" : "NO"));
            
            if (token != null) {
                System.out.println("JwtAuthenticationFilter: Validating token...");
                if (jwtTokenProvider.validateToken(token)) {
                    // Token valid - extract user info and store in request
                    Long userId = jwtTokenProvider.getUserIdFromToken(token);
                    String username = jwtTokenProvider.getUsernameFromToken(token);
                    
                    System.out.println("JwtAuthenticationFilter: Token VALID - userId=" + userId + ", username=" + username);
                    
                    // Store in request attributes for later use
                    request.setAttribute("userId", userId);
                    request.setAttribute("username", username);
                    
                    // Set Spring Security authentication context
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(username, null, null);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    System.out.println("JwtAuthenticationFilter: Authentication set in SecurityContext");
                } else {
                    System.err.println("JwtAuthenticationFilter: Token INVALID");
                    logger.warn("Invalid JWT token: " + token);
                }
            }
        } catch (Exception e) {
            System.err.println("JwtAuthenticationFilter: ERROR - " + e.getMessage());
            e.printStackTrace();
            // Log error if needed
            logger.error("Error setting user authentication", e);
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * Extract JWT token from Authorization header
     * Expected format: "Bearer <token>"
     */
    private String getTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        
        return null;
    }
}
