package com.example.seatrans.shared.security;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
 * Intercepts requests, validates JWT tokens, and sets Spring Security context
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    
    private final TokenProvider tokenProvider;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        try {
            String token = extractTokenFromRequest(request);
            
            if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (tokenProvider.validateToken(token)) {
                    // Extract user information from token
                    Long userId = tokenProvider.getUserIdFromToken(token);
                    String email = tokenProvider.getEmailFromToken(token);
                    List<String> roles = tokenProvider.getRolesFromToken(token);
                    
                    log.debug("JWT token validated for user: {} (ID: {}) with roles: {}", email, userId, roles);
                    
                    // Store in request attributes for downstream use
                    request.setAttribute("userId", userId);
                    request.setAttribute("email", email);
                    request.setAttribute("roles", roles);
                    
                    // Set Spring Security authentication context
                    List<GrantedAuthority> authorities = roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());
                    
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    // Token invalid/expired - return 401 to force frontend logout
                    log.warn("Invalid or expired JWT token provided - returning 401");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"success\":false,\"message\":\"Token expired or invalid\"}");
                    return;
                }
            }
        } catch (Exception e) {
            log.error("Failed to set user authentication: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Authentication failed\"}");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * Extract JWT token from Authorization header
     * Expected format: "Bearer <token>"
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader(AUTHORIZATION_HEADER);
        
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length());
        }
        
        return null;
    }
}
