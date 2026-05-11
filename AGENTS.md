# SGEPD-Project AI Agent Guide

This is a Spring Boot 3 microservices project with two independent services: **auth-service** and **user-service**, both written in Java 17 using Maven.

## Quick Start

### Build & Run
```bash
# Start PostgreSQL (creates auth_db, user_db, ticket_db)
docker-compose up -d

# Run auth-service (port 8081)
cd auth-service
./mvnw spring-boot:run

# Run user-service (port 8082) in another terminal
cd user-service
./mvnw spring-boot:run

# Run ticket-service (port 8083) in another terminal
cd ticket-service
./mvnw spring-boot:run

# Run tests
./mvnw test
```

### Key Directories
- **auth-service**: JWT-based authentication with role-based access control (ADMIN, TECHNICIEN, CLIENT)
- **user-service**: User management service
- **ticket-service**: Intervention ticket management (OUVERT → EN_COURS → RESOLU → FERME)
- **init-db**: PostgreSQL initialization script (`init.sql`)
- **docker-compose.yml**: Starts PostgreSQL with auto-initialization

## Architecture & Conventions

### Package Structure (Both Services)
```
com.digitello.{service_name}/
├── controller/       # REST endpoints (@RestController, @RequestMapping)
├── service/          # Business logic (@Service)
├── repository/       # Data access (@Repository, JpaRepository)
├── entity/           # JPA entities (@Entity)
├── dto/              # Request/Response DTOs (suffixed with Request/Response)
├── config/           # Spring configuration
└── security/         # Security config (auth-service only)
```

### Key Patterns
- **Dependency Injection**: `@RequiredArgsConstructor` with Lombok (no explicit @Autowired)
- **DTOs**: All API inputs/outputs use DTOs (LoginRequest, AuthResponse)
- **Error Handling**: Throw `RuntimeException` for validation/business errors
- **Database**: Hibernate `ddl-auto: update` auto-creates/alters tables
- **Credentials**: Currently hardcoded in `application.yaml` (postgres/mouad3at3at) — **must use environment variables in production**

### Security (auth-service)
- **JWT**: HS256 with 24-hour expiration; secret from `app.jwt.secret` property
- **Routes**: 
  - Public: `/api/auth/login`, `/api/auth/register` 
  - Protected: All other routes require JWT token
- **CORS**: Permissive (`@CrossOrigin(origins = "*")`)
- **Session**: STATELESS (JWT-based)

### Testing
- **Frameworks**: JUnit 5 (Jupiter) + Mockito
- **Unit Tests**: `@ExtendWith(MockitoExtension.class)` with `@Mock` and `@InjectMocks`
- **Integration Tests**: `@WebMvcTest` or `@SpringBootTest` with MockMvc
- **Location**: `src/test/java/com/digitello/{service_name}/` mirrors source structure
- **Run**: `./mvnw test`

### Database
- **Type**: PostgreSQL
- **Init**: `init-db/init.sql` creates databases; Hibernate creates tables
- **Naming**: snake_case columns (e.g., `created_at`, `full_name`)
- **DDL**: Automatic via Hibernate `ddl-auto: update` — do not use migrations tools yet

## Common Tasks

### Add a New REST Endpoint
1. Create DTO in `src/main/java/com/digitello/{service}/dto/` (use naming convention: `YourRequest`, `YourResponse`)
2. Add method to controller with `@PostMapping`, `@GetMapping`, etc.
3. Add business logic to service
4. Add repository method if needed
5. Write unit test in `src/test/java/com/digitello/{service}/controller/`

### Create a Ticket (Ticket Service)
```bash
curl -X POST http://localhost:8083/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "screenId": 10,
    "problemType": "panne matérielle",
    "description": "L'\''écran ne s'\''allume pas",
    "priority": "HAUTE",
    "createdByUserId": 1
  }'
```

### Manage Ticket Workflow
```bash
# Start working on ticket
curl -X PUT http://localhost:8083/api/tickets/{id}/start

# Mark as resolved
curl -X PUT http://localhost:8083/api/tickets/{id}/resolve \
  -H "Content-Type: application/json" \
  -d '{"interventionReport": "Écran remplacé"}'

# Close ticket
curl -X PUT http://localhost:8083/api/tickets/{id}/close

# Assign to technician
curl -X POST http://localhost:8083/api/tickets/{id}/assign \
  -H "Content-Type: application/json" \
  -d '{"technicianId": 5}'
```

### Add a New Database Table
1. Create `@Entity` class in `entity/` package with `@Id` and appropriate columns
2. Create `@Repository` interface extending `JpaRepository<YourEntity, Long>`
3. Hibernate will auto-create the table on next startup

### Add Authentication/Authorization to a Route
1. In controller method, add `@PreAuthorize` annotation (spring-security)
2. Or check role in service layer using `SecurityContext` (auth-service only)

## Important Constraints & Pitfalls

⚠️ **Hardcoded Credentials**: Database credentials are in `application.yaml` — extract to environment variables before production  
⚠️ **No Custom Exceptions**: Project uses generic `RuntimeException` — consider creating domain-specific exceptions for better error handling  
⚠️ **No Migration Tool**: Relies on Hibernate DDL auto-update — consider Flyway/Liquibase for complex migrations  
⚠️ **Permissive CORS**: All origins allowed — restrict in production  
⚠️ **Test Coverage**: Minimal for repositories and user-service — write tests when adding features  
⚠️ **Ticket Service Security**: No JWT validation on ticket endpoints yet — add authentication middleware for production  
⚠️ **Service Coupling**: Ticket service references external services (screen_id, technician_id) — consider adding inter-service validation  

## Dependencies & Versions
- **Spring Boot**: 3.5.14
- **Java**: 17
- **JWT**: jjwt 0.11.5
- **Database Driver**: postgresql (latest via pom)
- **Lombok**: Automatic @Data, @Builder, @RequiredArgsConstructor on data classes

## Related Documentation
- See [README.md](README.md) for project overview
- Check `docker-compose.yml` for database setup
- Review individual service `pom.xml` for full dependency list
