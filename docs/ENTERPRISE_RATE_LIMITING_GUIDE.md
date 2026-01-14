# Enterprise Hybrid Rate Limiting Strategy
## Overview
This document outlines the architecture for a multi-layered rate limiting strategy for the Seatrans application. It combines **Edge Security (Cloudflare)** for network protection and **Application Logic (Spring Boot)** for business-rule enforcement.

---

## 🏗️ Architecture Layers

| Layer | Technology | Responsibility | Scope |
|:---|:---|:---|:---|
| **L1: Edge** | **Cloudflare** | DDoS Mitigation, Bot Protection, Static Content Caching | IP Address, Geo-location |
| **L2: App** | **Spring Boot + Bucket4j** | Business Logic Limits, User Tiers, Write Operation Control | User ID, API Key, Specific Endpoints |
| **L3: Client** | **Next.js + Axios** | Retry Logic (Backoff), User Notification | UX Handling |

---

## 🛡️ Layer 1: Cloudflare Configuration (Edge)

### 1. WAF & Bot Protection
Prevent automated attacks before they reach the server.
*   **Security Level:** High.
*   **Bot Fight Mode:** On (JavaScript Challenge).
*   **WAF Rules (Custom):**
    *   *Rule:* If URI path contains `/api/auth/` AND Request Count > 10 / 1 minute.
    *   *Action:* Block or Managed Challenge (Captcha).

### 2. Caching Policies (Reduce Server Load)
Offload "Read" operations for static public data.
*   **Page Rules:**
    *   `*/api/ports*`: **Cache Level: Cache Everything** (TTL: 1 hour).
    *   `*/api/provinces*`: **Cache Level: Cache Everything** (TTL: 1 day).
    *   `*/uploads/*`: **Cache Level: Cache Everything** (TTL: 1 month).

---

## ⚙️ Layer 2: Spring Boot Implementation (Core)

This layer handles limits based on **WHO** the user is, not just where they come from. We use **Bucket4j** with **Redis** (recommended for cluster) or **Caffeine** (single instance).

### 1. Dependencies (`pom.xml`)
```xml
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.7.0</version>
</dependency>
<!-- Optional: Caffeine for high-performance local caching -->
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

### 2. IP Resolution (Critical)
Since we are behind Cloudflare, `request.getRemoteAddr()` returns Cloudflare's IP. You **must** use the `CF-Connecting-IP` header.

```java
public String getClientIp(HttpServletRequest request) {
    String xfHeader = request.getHeader("CF-Connecting-IP");
    if (xfHeader == null) {
        return request.getRemoteAddr();
    }
    return xfHeader;
}
```

### 3. Rate Limit Plans (The "Golden Ratios")

| Plan Type | Endpoint Pattern | Limit | Refill Rate | Reasoning |
|:---|:---|:---|:---|:---|
| **Auth** | `/api/auth/**` | 10 reqs | 5 per min | Prevent brute force. |
| **Public** | `/api/inquiries/public` | 30 reqs | 10 per min | Prevent spam submissions. |
| **User** | `/api/**` (Authenticated) | 100 reqs | 50 per min | Standard usage. |
| **Admin** | `/api/admin/**` | 500 reqs | 500 per min | High throughput for management. |

### 4. Implementation Example (Service Service)
```java
@Service
public class RateLimitingService {
    
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String apiKey) {
        return cache.computeIfAbsent(apiKey, this::newBucket);
    }

    private Bucket newBucket(String apiKey) {
        // Example: General limit
        return Bucket.builder()
            .addLimit(Bandwidth.classic(50, Refill.intervally(50, Duration.ofMinutes(1))))
            .build();
    }
}
```

---

## 🖥️ Layer 3: Client-Side Handling (Next.js)

Do not let the app crash when rate limited. Handle `429 Too Many Requests` gracefully.

### 1. Axios Interceptor Strategy
In `axiosConfig.ts`:

```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      // 1. Get Retry-After header
      const retryAfter = error.response.headers['retry-after'] || 5;
      
      // 2. Show Toast to User
      toast.error(`System busy. Please wait ${retryAfter} seconds.`);
      
      // 3. Optional: Auto-retry for GET requests (Exponential Backoff)
      // Only for non-mutating requests
    }
    return Promise.reject(error);
  }
);
```

---

## 📈 Monitoring & Alerts

For an enterprise system, you cannot fly blind.

1.  **Status 429 Monitoring:**
    *   Set up an alert in your logs (ELK/Graylog) if `429` responses spike > 5% of traffic.
    *   This indicates legitimate users are being blocked OR a massive attack is underway.

2.  **Custom Headers:**
    *   Return headers to the client so they can self-regulate:
        *   `X-Rate-Limit-Limit`: 100
        *   `X-Rate-Limit-Remaining`: 99
        *   `X-Rate-Limit-Reset`: 163283282

## 🚀 Summary Checklist

1.  [ ] Enable Cloudflare Proxy (Orange Cloud).
2.  [ ] Configure "Cache Everything" Page Rules for static APIs.
3.  [ ] Install Bucket4j in Spring Boot.
4.  [ ] Implement `CF-Connecting-IP` extraction logic.
5.  [ ] Apply RateLimit Filter to critical WRITE endpoints (`POST`, `PUT`, `DELETE`).
6.  [ ] Update Frontend Axios interceptor to handle 429.
