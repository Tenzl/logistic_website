package com.example.seatrans.shared.filter;

import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.example.seatrans.features.user.model.User;
import com.example.seatrans.features.user.service.UserService;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Unified Authentication & Authorization Filter
 * Handles JWT-based authentication for all protected routes
 */
@Component
@Order(1)
@RequiredArgsConstructor
public class AdminAuthFilter implements Filter {

    private final UserService userService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String requestURI = httpRequest.getRequestURI();

        // Skip public endpoints
        if (isPublicEndpoint(requestURI)) {
            chain.doFilter(request, response);
            return;
        }

        // Check authentication for ANY /api/* route (except public ones)
        if (requestURI.startsWith("/api/")) {
            // Check userId from request attribute (set by JwtAuthenticationFilter)
            Long userId = (Long) httpRequest.getAttribute("userId");

            if (userId == null) {
                handleUnauthenticated(httpRequest, httpResponse);
                return;
            }
        }

        // Check role-based authorization for specific routes
        if (requestURI.startsWith("/admin/") ||
                requestURI.startsWith("/api/admin/") ||
                requestURI.startsWith("/api/customer/") ||
                requestURI.startsWith("/api/employee/")) {

            // Get userId from JWT token
            Long userId = (Long) httpRequest.getAttribute("userId");

            if (userId == null) {
                handleUnauthenticated(httpRequest, httpResponse);
                return;
            }

            // Get user roles from database
            User user = userService.getUserById(userId);
            Set<String> roles = user.getRoles().stream()
                    .map(role -> role.getName())
                    .collect(Collectors.toSet());

            if (requestURI.startsWith("/admin/") || requestURI.startsWith("/api/admin/")) {
                if (roles == null || !roles.contains("ROLE_ADMIN")) {
                    handleUnauthorized(httpRequest, httpResponse, "ADMIN");
                    return;
                }
            }

            if (requestURI.startsWith("/api/customer/")) {
                if (roles == null || !roles.contains("ROLE_CUSTOMER")) {
                    handleUnauthorized(httpRequest, httpResponse, "CUSTOMER");
                    return;
                }
            }

            if (requestURI.startsWith("/api/employee/")) {
                if (roles == null || (!roles.contains("ROLE_EMPLOYEE") && !roles.contains("ROLE_ADMIN"))) {
                    handleUnauthorized(httpRequest, httpResponse, "EMPLOYEE or ADMIN");
                    return;
                }
            }
        }

        // Allow request to continue
        chain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String uri) {
        return uri.equals("/") ||
                uri.equals("/home") ||
                uri.equals("/api/auth/login") ||
                uri.equals("/api/auth/logout") ||
                uri.equals("/api/auth/register") ||
                uri.equals("/api/auth/register/customer") ||
                uri.startsWith("/api/public/") ||
                uri.startsWith("/api/posts") ||
                uri.startsWith("/api/categories") ||
                uri.startsWith("/api/provinces/") ||
                uri.startsWith("/api/ports/") ||
                uri.startsWith("/api/gallery/images") ||
                uri.startsWith("/api/gallery-images") ||
                uri.startsWith("/api/image-types") ||
                uri.startsWith("/shipping-agency/") ||
                uri.startsWith("/css/") ||
                uri.startsWith("/js/") ||
                uri.startsWith("/images/") ||
                uri.equals("/favicon.ico");
    }

    private void handleUnauthenticated(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        String requestURI = request.getRequestURI();

        if (requestURI.startsWith("/api/")) {
            // API request - return JSON
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Authentication required. Please login.\"}");
        } else {
            // Web page request - redirect to login
            response.sendRedirect("/login");
        }
    }

    private void handleUnauthorized(HttpServletRequest request, HttpServletResponse response, String requiredRole)
            throws IOException {
        String requestURI = request.getRequestURI();

        if (requestURI.startsWith("/api/")) {
            // API request - return JSON
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Access denied. Required role: " + requiredRole + "\"}");
        } else {
            // Web page request - show error page
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("text/html");
            response.getWriter().write(
                    "<!DOCTYPE html><html><head><title>Access Denied</title>" +
                            "<style>body{font-family:Arial;text-align:center;padding:50px;}" +
                            "h1{color:#dc3545;}</style></head><body>" +
                            "<h1>â›” Access Denied</h1>" +
                            "<p>You do not have permission to access this page.</p>" +
                            "<p>Required role: <strong>" + requiredRole + "</strong></p>" +
                            "<a href='/home' style='color:#667eea;text-decoration:none;'>â† Go to Home</a>" +
                            "</body></html>");
        }
    }
}
