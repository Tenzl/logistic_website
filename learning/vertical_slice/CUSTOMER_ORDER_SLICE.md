# Customer & Order Management Slice

## Description
Handles customer interactions, service requests, and order processing.

## Files to Move

### Controllers
- `src/main/java/com/example/seatrans/controller/CustomerController.java`
- `src/main/java/com/example/seatrans/controller/CustomerOrderController.java`
- `src/main/java/com/example/seatrans/controller/CustomerRequestController.java`
- `src/main/java/com/example/seatrans/controller/ShippingAgencyController.java` (If related to customer requests)

### Services
- `src/main/java/com/example/seatrans/service/CustomerService.java`
- `src/main/java/com/example/seatrans/service/OrderService.java`
- `src/main/java/com/example/seatrans/service/ServiceRequestService.java`

### Entities
- `src/main/java/com/example/seatrans/entity/Order.java`
- `src/main/java/com/example/seatrans/entity/OrderItem.java`
- `src/main/java/com/example/seatrans/entity/ServiceRequest.java`

### Repositories
- `src/main/java/com/example/seatrans/repository/OrderRepository.java`
- `src/main/java/com/example/seatrans/repository/ServiceRequestRepository.java`
- `src/main/java/com/example/seatrans/repository/CustomerRepository.java` (if exists)

### DTOs
- Related DTOs for Orders and Requests

## New Location
`src/main/java/com/example/seatrans/features/orders/`
