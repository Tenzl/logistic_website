# XSS Protection Implementation Guide

## Tổng quan bảo mật XSS đã implement

### ✅ Đã hoàn thành

#### 1. Backend Security

**a. OWASP HTML Sanitizer**
- **File**: `backend/pom.xml`
- **Dependency**: `owasp-java-html-sanitizer` version 20220608.1
- **Mục đích**: Lọc và làm sạch HTML input từ user

**b. HtmlSanitizer Utility**
- **File**: `backend/src/main/java/com/example/seatrans/shared/util/HtmlSanitizer.java`
- **Methods**:
  1. `sanitizeRichText(String html)` - Cho blog posts, cho phép HTML tags an toàn
  2. `sanitizeBasicText(String html)` - Cho text với format cơ bản
  3. `toPlainText(String input)` - Strip tất cả HTML, chỉ giữ plain text
  4. `escapeUserInput(String input)` - Escape special characters

**c. PostService Sanitization**
- **File**: `backend/src/main/java/com/example/seatrans/features/post/service/PostService.java`
- **Áp dụng**:
  - `createPost()`: Sanitize title (plain text) và content (rich text)
  - `updatePost()`: Sanitize title (plain text) và content (rich text)

**d. Validation Annotations**
- Tất cả DTOs đã có `@NotBlank`, `@Size`, `@Email` validation
- Controllers đã có `@Valid` và `@Validated` annotations
- GlobalExceptionHandler xử lý validation errors

---

### ⚠️ Cần implement thêm

#### 1. Inquiry Services (HIGH PRIORITY)

**Các file cần thêm sanitization**:

```java
// PublicInquiryController.java
@Autowired
private HtmlSanitizer htmlSanitizer;

// Trong method submitInquiry():
request.setSubject(htmlSanitizer.toPlainText(request.getSubject()));
request.setMessage(htmlSanitizer.sanitizeBasicText(request.getMessage()));
request.setNotes(htmlSanitizer.sanitizeBasicText(request.getNotes()));

// Sanitize tất cả text fields trong:
// - ShippingAgencyInquiry
// - CharteringBrokingInquiry  
// - FreightForwardingInquiry
// - SpecialRequestInquiry
// - TotalLogisticInquiry
```

**Pattern áp dụng**:
```java
// Plain text fields (names, titles, email, phone)
field = htmlSanitizer.toPlainText(field);

// Text với format cơ bản (notes, messages, descriptions)
field = htmlSanitizer.sanitizeBasicText(field);

// Rich text content (blog content, long descriptions)
field = htmlSanitizer.sanitizeRichText(field);
```

#### 2. Other Services

**Office Service**:
```java
// OfficeService.java
office.setName(htmlSanitizer.toPlainText(request.getName()));
office.setAddress(htmlSanitizer.toPlainText(request.getAddress()));
office.setManagerName(htmlSanitizer.toPlainText(request.getManagerName()));
```

**Province/Port Services**:
```java
province.setName(htmlSanitizer.toPlainText(request.getName()));
port.setName(htmlSanitizer.toPlainText(request.getName()));
```

**Category Service**:
```java
category.setName(htmlSanitizer.toPlainText(request.getName()));
category.setDescription(htmlSanitizer.sanitizeBasicText(request.getDescription()));
```

#### 3. Frontend Security

**DOMPurify for React** (CRITICAL):
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

**ArticleDetailPage.tsx**:
```typescript
import DOMPurify from 'dompurify';

// Replace line 217:
const sanitizedHtml = DOMPurify.sanitize(decoratedHtml, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id']
});

dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
```

---

## Best Practices

### ✅ Input Validation Rules

1. **User Names, Emails, Phone**: `toPlainText()` - No HTML allowed
2. **Short Text (titles, subjects)**: `toPlainText()` - No HTML allowed  
3. **Messages, Notes**: `sanitizeBasicText()` - Basic formatting only
4. **Blog Content**: `sanitizeRichText()` - Safe HTML tags only

### ✅ Output Encoding

1. **Backend**: Always sanitize BEFORE saving to database
2. **Frontend**: Use DOMPurify before rendering with `dangerouslySetInnerHTML`
3. **API Responses**: Data already sanitized in backend

### ✅ Additional Security Headers

**application.properties**:
```properties
# XSS Protection
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=true

# Content Security Policy
spring.security.headers.content-security-policy=default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

---

## Testing XSS Protection

### Test Cases

1. **Script Injection**:
```
Input: <script>alert('XSS')</script>
Expected: (empty or escaped text)
```

2. **Event Handler**:
```
Input: <img src=x onerror="alert('XSS')">
Expected: <img src="x"> (onerror removed)
```

3. **Data URI**:
```
Input: <a href="javascript:alert('XSS')">Click</a>
Expected: <a>Click</a> (href removed or blocked)
```

4. **HTML Entities**:
```
Input: &lt;script&gt;alert('XSS')&lt;/script&gt;
Expected: <script>alert('XSS')</script> (escaped, not executed)
```

---

## Migration Checklist

- [x] Add OWASP HTML Sanitizer dependency
- [x] Create HtmlSanitizer utility class
- [x] Sanitize PostService (create/update)
- [ ] Sanitize all Inquiry services (5 types)
- [ ] Sanitize Office/Province/Port services
- [ ] Sanitize Category service
- [ ] Install DOMPurify for frontend
- [ ] Update ArticleDetailPage with DOMPurify
- [ ] Add security headers to application.properties
- [ ] Write unit tests for sanitization
- [ ] Security audit all user input points

---

## Monitoring & Logging

**Log suspicious input**:
```java
if (input.contains("<script") || input.contains("javascript:")) {
    log.warn("Potential XSS attempt detected from user: {}", userId);
}
```

**Track sanitization**:
```java
log.debug("Sanitized content: original={}, sanitized={}", 
    original.length(), sanitized.length());
```

---

## Documentation

**Developer Guidelines**:
1. NEVER trust user input
2. ALWAYS sanitize before database save
3. ALWAYS use DOMPurify before rendering HTML
4. NEVER use `dangerouslySetInnerHTML` without sanitization
5. Test XSS protection in all forms

**Code Review Checklist**:
- [ ] All user inputs sanitized?
- [ ] Proper sanitization method used?
- [ ] DOMPurify used for HTML rendering?
- [ ] Validation annotations present?
- [ ] Error messages don't leak sensitive data?
