# Content Management Slice (Posts)

## Description
Handles the creation, editing, publishing, and viewing of blog posts and news articles.

## Files to Move

### Controllers
- `src/main/java/com/example/seatrans/controller/PostController.java` (Admin)
- `src/main/java/com/example/seatrans/controller/PostPublicController.java` (Public)

### Services
- `src/main/java/com/example/seatrans/service/PostService.java`

### Entities
- `src/main/java/com/example/seatrans/entity/Post.java`

### Repositories
- `src/main/java/com/example/seatrans/repository/PostRepository.java`

### DTOs
- `src/main/java/com/example/seatrans/dto/PostRequest.java`
- `src/main/java/com/example/seatrans/dto/PostResponse.java`

## New Location
`src/main/java/com/example/seatrans/features/content/`
