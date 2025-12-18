# Refactoring to Vertical Slice Architecture

## Current Architecture (Layered)
The current application uses a traditional Layered Architecture, where code is organized by technical concern:
- `controller/`: Handles HTTP requests
- `service/`: Contains business logic
- `repository/`: Handles data access
- `entity/`: Defines data models
- `dto/`: Data Transfer Objects

## Proposed Architecture (Vertical Slice)
In Vertical Slice Architecture, code is organized by **feature** or **domain concept**. Each slice contains all the layers (Controller, Service, Repository, Entity) needed to implement that feature.

### Benefits
- **Cohesion**: Related code is kept together.
- **Decoupling**: Features are less dependent on each other.
- **Maintainability**: Easier to understand and modify a specific feature without navigating the entire codebase.

### Proposed Structure
`src/main/java/com/example/seatrans/features/`
  - `auth/` (Authentication & User Management)
  - `content/` (Blog Posts & News)
  - `gallery/` (Image Gallery & Types)
  - `logistics/` (Ports, Provinces, Locations)
  - `orders/` (Customer Orders & Requests)
  - `pricing/` (Quotations, Fee Configurations, Calculator)
  - `services/` (Service Types Configuration)

`src/main/java/com/example/seatrans/shared/`
  - `config/`
  - `exception/`
  - `util/`
  - `security/`

## Migration Strategy
1. Create the `features` package.
2. Move files one slice at a time.
3. Update package declarations and imports.
4. Verify tests.
