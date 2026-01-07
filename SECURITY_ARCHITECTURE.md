# Security Architecture - Refactored

## 📁 Cấu trúc mới (Clean & Standard)

```
shared/
├── config/
│   ├── SecurityConfig.java          ✅ Spring Security configuration
│   └── WebMvcConfig.java            ✅ Static resources only
├── security/
│   ├── TokenProvider.java           ✅ NEW - Interface for token operations
│   ├── JwtTokenProvider.java        ✅ IMPROVED - JWT implementation
│   └── JwtAuthenticationFilter.java ✅ IMPROVED - JWT filter with proper logging
└── filter/
    └── AdminAuthFilter.java         ❌ DELETED - Redundant
```

## ✨ Improvements

### 1. **Interface-based Design**
- Created `TokenProvider` interface
- Easy to swap JWT with OAuth2, SAML, etc.
- Better testability

### 2. **Proper Logging**
- Replaced `System.out.println` with SLF4J logger
- Better error categorization (SignatureException, ExpiredJwtException, etc.)
- Debug logs for development, error logs for production

### 3. **Removed Redundancy**
- Deleted `AdminAuthFilter` (was disabled and duplicate logic)
- Authorization now handled by:
  - `SecurityConfig` (route-level)
  - `@PreAuthorize` (method-level)

### 4. **Clean Code**
- Constants for header names (`AUTHORIZATION_HEADER`, `BEARER_PREFIX`)
- Better method names (`extractTokenFromRequest`)
- Consistent error handling

## 🔄 Request Flow

```
1. Request arrives
   ↓
2. JwtAuthenticationFilter
   - Extract JWT from Authorization header
   - Validate token signature & expiration
   - Extract userId, username, roles
   - Set Spring SecurityContext
   ↓
3. SecurityConfig
   - Check if route requires authentication
   - Verify authorities match route requirements
   ↓
4. @PreAuthorize (optional)
   - Method-level authorization
   - hasRole("ADMIN"), hasAuthority(), etc.
   ↓
5. Controller method executes
```

## 🔐 Token Provider Interface

```java
public interface TokenProvider {
    String generateToken(User user);
    String generateRefreshToken(User user);
    boolean validateToken(String token);
    String getUsernameFromToken(String token);
    Long getUserIdFromToken(String token);
    List<String> getRolesFromToken(String token);
}
```

## 📝 Usage Examples

### In Controller
```java
@RestController
@RequiredArgsConstructor
public class AuthController {
    private final TokenProvider tokenProvider; // ← Interface, not concrete class
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginDTO dto) {
        User user = authenticate(dto);
        String token = tokenProvider.generateToken(user);
        return ResponseEntity.ok(new AuthResponseDTO(token, user));
    }
}
```

### Swap Implementation (Future)
```java
// Easy to create OAuth2TokenProvider, SAMLTokenProvider, etc.
@Component
@Primary
public class OAuth2TokenProvider implements TokenProvider {
    // Different implementation, same interface
}
```

## 🎯 Benefits

1. ✅ **Single Responsibility** - Each class has one job
2. ✅ **No Duplication** - Removed AdminAuthFilter
3. ✅ **Better Logging** - SLF4J instead of System.out
4. ✅ **Testable** - Interface allows easy mocking
5. ✅ **Maintainable** - Clear separation of concerns
6. ✅ **Extensible** - Easy to add new token types

## ⚠️ Breaking Changes

None! API remains the same. All existing code continues to work.

## 🔜 Future Enhancements

1. Token blacklist/revocation (Redis)
2. Rate limiting for auth endpoints
3. 2FA support via TokenProvider interface
4. OAuth2 provider implementation
