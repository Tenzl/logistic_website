# Redis Integration Plan

## Overview
Redis integration để cải thiện security, performance, và scalability cho SeaTrans platform.

---

## Phase 1: Security & Abuse Prevention (Priority: HIGH)

### 1.1 JWT Token Blacklist
**Problem:** 
- JWT tokens là stateless - không thể revoke trước khi expire
- User logout nhưng token vẫn valid trong 24 giờ
- Không thể force logout khi detect suspicious activity

**Solution:**
```java
// Khi user logout
public void logout(String token) {
    long remainingTime = jwtTokenProvider.getExpirationTime(token);
    redisTemplate.opsForValue().set(
        "token:blacklist:" + token,
        "revoked",
        Duration.ofMillis(remainingTime)
    );
}

// JwtAuthenticationFilter - check before validate
if (redisTemplate.hasKey("token:blacklist:" + token)) {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.getWriter().write("{\"message\":\"Token has been revoked\"}");
    return;
}
```

**Benefits:**
- ✅ Secure logout - token immediately invalid
- ✅ Admin có thể force revoke user's token
- ✅ Phát hiện stolen token → blacklist ngay lập tức
- ✅ TTL tự động expire → không tốn memory

**Keys:**
- `token:blacklist:{tokenHash}` → "revoked" (TTL: token expiration time)

---

### 1.2 Rate Limiting
**Problem:**
- Public inquiry endpoints có thể bị spam
- Brute force attacks trên login endpoint
- Không limit số request từ 1 IP/user

**Solution:**
```java
@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) {
        String ipAddress = getClientIP(request);
        String endpoint = request.getRequestURI();
        String key = "rate_limit:" + ipAddress + ":" + endpoint;
        
        Long requests = redisTemplate.opsForValue().increment(key);
        
        if (requests == 1) {
            redisTemplate.expire(key, Duration.ofMinutes(1));
        }
        
        int limit = getRateLimitForEndpoint(endpoint);
        if (requests > limit) {
            response.setStatus(429); // Too Many Requests
            response.getWriter().write("{\"message\":\"Rate limit exceeded\"}");
            return false;
        }
        
        return true;
    }
}
```

**Rate Limits:**
- `/api/v1/auth/login` → 5 requests/minute per IP
- `/api/v1/inquiries` (POST) → 10 requests/minute per IP
- `/api/v1/auth/signup` → 3 requests/minute per IP
- `/api/v1/admin/**` → 100 requests/minute per user

**Benefits:**
- ✅ Prevent spam inquiry submissions
- ✅ Protect against brute force login attempts
- ✅ Fair resource usage
- ✅ DDoS mitigation

**Keys:**
- `rate_limit:{ip}:{endpoint}` → counter (TTL: 1 minute)

---

## Phase 2: Performance Optimization (Priority: MEDIUM)

### 2.1 Cache Static Reference Data
**Problem:**
- Provinces, Ports query nhiều nhưng ít thay đổi
- Service types được lookup trong mỗi inquiry
- Database hit không cần thiết

**Solution:**
```java
@Service
public class ProvinceService {
    
    @Cacheable(value = "provinces", key = "#id")
    public ProvinceDTO getProvinceById(Long id) {
        // Only hit DB if not in cache
        return provinceRepository.findById(id)
            .map(entityMapper::toProvinceDTO)
            .orElseThrow();
    }
    
    @CacheEvict(value = "provinces", allEntries = true)
    public Province updateProvince(Province province) {
        // Clear cache when update
        return provinceRepository.save(province);
    }
    
    @Cacheable(value = "provinces:active")
    public List<ProvinceDTO> getActiveProvinces() {
        return provinceRepository.findByIsActiveTrue()
            .stream()
            .map(entityMapper::toProvinceDTO)
            .collect(Collectors.toList());
    }
}
```

**Cache Strategy:**
- **Provinces** → TTL: 24 hours (rarely change)
- **Ports** → TTL: 12 hours
- **Service Types** → TTL: 24 hours
- **Roles** → TTL: 24 hours

**Benefits:**
- ✅ Reduce database load 70-80%
- ✅ Faster response time (ms vs 10-50ms)
- ✅ Better scalability

**Keys:**
- `provinces:{id}` → ProvinceDTO JSON
- `provinces:active` → List<ProvinceDTO> JSON
- `ports:province:{provinceId}` → List<PortDTO> JSON
- `service_types:active` → List<ServiceTypeDTO> JSON

---

### 2.2 Refresh Token Storage
**Problem:**
- Refresh tokens stored in database table
- Lookup requires DB query
- Revocation requires DB update

**Solution:**
```java
// Store refresh token in Redis instead of DB
public String generateAndStoreRefreshToken(User user) {
    String refreshToken = tokenProvider.generateRefreshToken(user);
    String key = "refresh_token:user:" + user.getId();
    
    redisTemplate.opsForValue().set(
        key,
        refreshToken,
        Duration.ofDays(7)
    );
    
    return refreshToken;
}

// Validate and rotate
public String refreshAccessToken(String refreshToken) {
    if (!tokenProvider.validateToken(refreshToken)) {
        throw new InvalidTokenException();
    }
    
    Long userId = tokenProvider.getUserIdFromToken(refreshToken);
    String storedToken = redisTemplate.opsForValue()
        .get("refresh_token:user:" + userId);
    
    if (!refreshToken.equals(storedToken)) {
        throw new InvalidTokenException("Token mismatch");
    }
    
    User user = userService.getUserById(userId);
    String newAccessToken = tokenProvider.generateToken(user);
    
    return newAccessToken;
}

// Logout - revoke all sessions
public void logoutAllDevices(Long userId) {
    redisTemplate.delete("refresh_token:user:" + userId);
}
```

**Benefits:**
- ✅ Faster token refresh (no DB query)
- ✅ Easy to revoke all user sessions
- ✅ Automatic expiration with TTL
- ✅ Reduce database load

**Keys:**
- `refresh_token:user:{userId}` → refresh token string (TTL: 7 days)

---

## Phase 3: Real-time Features (Priority: LOW - Future Enhancement)

### 3.1 Real-time Inquiry Status Updates
**Problem:**
- Frontend phải poll API để check inquiry status
- Không có real-time notification khi admin process inquiry
- Poor UX for customers waiting for response

**Solution:**
```java
// Backend - Publish status change
@Service
public class InquiryService {
    
    public void updateInquiryStatus(Long inquiryId, String newStatus) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
            .orElseThrow();
        
        inquiry.setStatus(newStatus);
        inquiryRepository.save(inquiry);
        
        // Publish to Redis Pub/Sub
        InquiryStatusUpdateDTO update = new InquiryStatusUpdateDTO(
            inquiryId,
            newStatus,
            LocalDateTime.now()
        );
        
        redisTemplate.convertAndSend(
            "inquiry:status:updates",
            update
        );
    }
}

// Frontend - Subscribe via WebSocket/SSE
// When user on inquiry detail page, listen for updates
```

**Benefits:**
- ✅ Real-time updates without polling
- ✅ Better user experience
- ✅ Reduce unnecessary API calls

**Channels:**
- `inquiry:status:updates` → Pub/Sub channel for status changes

---

### 3.2 Session Management & Analytics
**Future use case:**
```java
// Track active users
redisTemplate.opsForSet().add("active_users", userId);

// Count online users
Long onlineCount = redisTemplate.opsForSet().size("active_users");

// Track user activity
redisTemplate.opsForHash().put(
    "user:activity:" + userId,
    "last_seen",
    LocalDateTime.now().toString()
);
```

---

## Implementation Steps

### Step 1: Add Dependencies
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

### Step 2: Configuration
```properties
# application.properties
spring.data.redis.host=${REDIS_HOST:localhost}
spring.data.redis.port=${REDIS_PORT:6379}
spring.data.redis.password=${REDIS_PASSWORD:}
spring.data.redis.timeout=2000ms

# Cache configuration
spring.cache.type=redis
spring.cache.redis.time-to-live=3600000
```

### Step 3: Redis Configuration Class
```java
@Configuration
@EnableCaching
public class RedisConfig {
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // JSON serialization
        Jackson2JsonRedisSerializer<Object> serializer = 
            new Jackson2JsonRedisSerializer<>(Object.class);
        
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);
        
        template.afterPropertiesSet();
        return template;
    }
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration
            .defaultCacheConfig()
            .entryTtl(Duration.ofHours(1))
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair
                    .fromSerializer(new StringRedisSerializer())
            );
        
        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .build();
    }
}
```

### Step 4: Deployment (Render.com)
1. Add Redis add-on in Render dashboard
2. Set `REDIS_HOST` and `REDIS_PASSWORD` environment variables
3. Deploy backend with Redis dependencies

---

## Monitoring & Metrics

### Key Metrics to Track:
- **Cache hit rate**: `provinces:*`, `ports:*`
- **Rate limit triggers**: Count per endpoint
- **Blacklisted tokens**: Count active blacklist entries
- **Memory usage**: Total Redis memory

### Commands for Debugging:
```bash
# Check all keys
redis-cli KEYS "*"

# Monitor real-time commands
redis-cli MONITOR

# Check cache hit/miss stats
redis-cli INFO stats

# Check memory usage
redis-cli INFO memory
```

---

## Estimated Impact

| Feature | Database Load Reduction | Response Time Improvement | Security Improvement |
|---------|------------------------|---------------------------|---------------------|
| Token Blacklist | 0% | 0ms | ⭐⭐⭐⭐⭐ |
| Rate Limiting | 0% | 0ms | ⭐⭐⭐⭐⭐ |
| Cache Static Data | 70-80% | 20-40ms | - |
| Refresh Token Storage | 30-40% | 10-20ms | ⭐⭐⭐ |

---

## Cost Consideration

**Render.com Redis Pricing:**
- Free tier: 25MB storage (enough for Phase 1)
- Starter: $7/month - 256MB (sufficient for all phases)

**Memory Estimation:**
- Token blacklist: ~1KB per token × avg 100 active = 100KB
- Rate limiting: ~100 bytes per key × avg 500 = 50KB
- Cache data: ~500KB (provinces, ports, service types)
- **Total Phase 1+2**: ~650KB (well within free tier)

---

## Timeline

- **Week 1-2**: Phase 1 - Token Blacklist & Rate Limiting
- **Week 3-4**: Phase 2 - Cache Static Data
- **Month 2**: Phase 2 - Refresh Token Storage
- **Future**: Phase 3 - Real-time features when needed

---

## Notes
- Start with Phase 1 for immediate security benefits
- Monitor Redis metrics before adding more features
- Consider Redis Cluster when scaling beyond single instance
- All TTL values are configurable via application.properties
