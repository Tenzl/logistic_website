package com.example.seatrans.shared.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.seatrans.shared.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

/**
 * Simplified Security Configuration
 * Uses JWT authentication for stateless API
 * AdminAuthFilter enforces role-based access for admin routes
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    /**
     * Password encoder bean for hashing passwords
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * CORS configuration to allow frontend access
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow all origins patterns to handle various localhost ports and IPs during dev
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        // Include PATCH for admin status updates
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    /**
     * Security filter chain - permits all requests
     * JWT token validated by JwtAuthenticationFilter
     * Authorization handled by custom filters (AdminAuthFilter)
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"success\":false,\"message\":\"Authentication required\",\"path\":\"" + request.getRequestURI() + "\"}"
                    );
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"success\":false,\"message\":\"Access denied\",\"path\":\"" + request.getRequestURI() + "\"}"
                    );
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Let Spring's error controller respond without auth (prevents masking real errors as 401)
                .requestMatchers("/error").permitAll()
                // Allow CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/auth/oauth2/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // Public content endpoints
                .requestMatchers("/api/v1/provinces/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/ports/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                .requestMatchers("/api/v1/posts/**").permitAll()
                .requestMatchers("/api/v1/gallery/**").permitAll()
                .requestMatchers("/api/v1/gallery-images/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/image-types/**").permitAll()
                .requestMatchers("/api/v1/offices/**").permitAll()
                .requestMatchers("/api/v1/service-types/**").permitAll()
                // User inquiry history (authenticated users only)
                .requestMatchers(HttpMethod.GET, "/api/v1/inquiries/user/**").authenticated()
                // Inquiry submission requires authentication
                .requestMatchers(HttpMethod.POST, "/api/v1/inquiries").authenticated()
                // Public inquiry listing
                .requestMatchers(HttpMethod.GET, "/api/v1/inquiries").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/inquiries/**").permitAll()
                // Admin-only endpoints
                .requestMatchers("/api/v1/admin/**").hasAnyAuthority("ROLE_ADMIN", "ADMIN")
                // Allow static files if served by Spring
                .requestMatchers("/uploads/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .formLogin(form -> form.disable())
            .logout(logout -> logout.disable());
        
        return http.build();
    }
}
