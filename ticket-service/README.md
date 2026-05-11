# Ticket Service

Le **Ticket Service** est un microservice Spring Boot responsable de la gestion des tickets d'intervention pour les écrans du parc SGEPD.

## Fonctionnalités

### Cas d'utilisation implémentés
- **CU-08** : Créer un ticket d'intervention
- **CU-09** : Suivre les tickets (workflow)
- **CU-10** : Assigner un ticket à un technicien

### Statuts de ticket
- `OUVERT` - Ticket nouvellement créé, en attente d'assignation
- `EN_COURS` - Un technicien travaille sur le problème
- `RESOLU` - Le problème est résolu, en attente de clôture
- `FERME` - Ticket archivé

### Priorités
- `BASSE`
- `MOYENNE`
- `HAUTE`
- `CRITIQUE`

## API REST Endpoints

### Créer un ticket
```
POST /api/tickets
Content-Type: application/json

{
  "screenId": 10,
  "problemType": "panne matérielle",
  "description": "L'écran ne s'allume pas",
  "priority": "HAUTE",
  "createdByUserId": 1
}
```

### Récupérer un ticket
```
GET /api/tickets/{id}
GET /api/tickets/number/{ticketNumber}
```

### Lister les tickets
```
GET /api/tickets                              # Tous les tickets
GET /api/tickets/status/{status}              # Par statut
GET /api/tickets/screen/{screenId}            # Par écran
GET /api/tickets/screen/{screenId}/open       # Tickets ouverts pour un écran
GET /api/tickets/technician/{technicianId}    # Assignés à un technicien
GET /api/tickets/technician/{technicianId}/active  # Actifs pour un technicien
GET /api/tickets/unassigned                   # Non assignés
```

### Assigner un ticket
```
POST /api/tickets/{id}/assign
Content-Type: application/json

{
  "technicianId": 5
}
```

### Workflow du ticket

#### Démarrer (Ouvert → En cours)
```
PUT /api/tickets/{id}/start
```

#### Résoudre (En cours → Résolu)
```
PUT /api/tickets/{id}/resolve
Content-Type: application/json

{
  "interventionReport": "Actions effectuées, pièces remplacées, etc."
}
```

#### Clôturer (Résolu → Fermé)
```
PUT /api/tickets/{id}/close
```

#### Réouvrir (Fermé → Ouvert)
```
PUT /api/tickets/{id}/reopen
```

#### Transférer (En cours → Nouveau technicien)
```
PUT /api/tickets/{id}/transfer
Content-Type: application/json

{
  "newTechnicianId": 7
}
```

## Démarrage du service

### Prérequis
- Java 17+
- Maven 3.6+
- PostgreSQL (démarré via docker-compose)

### Build et run
```bash
# Démarrer PostgreSQL
cd SGEPD-Project
docker-compose up -d

# Builder et démarrer ticket-service
cd ticket-service
./mvnw clean install
./mvnw spring-boot:run
```

Le service démarre sur **port 8083**

### Run les tests
```bash
./mvnw test
```

## Architecture

### Structu

re des packages
```
com.digitello.ticket_service/
├── controller/          # REST endpoints
├── service/             # Logique métier (TicketService)
├── repository/          # Accès aux données (TicketRepository)
├── entity/              # Entités JPA (Ticket, TicketStatus, TicketPriority)
├── dto/                 # DTOs (CreateTicketRequest, TicketResponse, etc.)
└── config/              # Configuration (SecurityConfig)
```

### Base de données
- **Base**: `ticket_db`
- **Table**: `tickets`
- **Colonnes principales**: 
  - `id` (PK)
  - `ticket_number` (UNIQUE)
  - `screen_id` (FK vers screen_db.screens)
  - `status` (ENUM)
  - `priority` (ENUM)
  - `assigned_to_technician_id` (FK vers auth_db.users)
  - `created_at`, `updated_at`, `started_at`, `resolved_at`, `closed_at`

## Configuration

### application.yaml
```yaml
server:
  port: 8083

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ticket_db
    username: postgres
    password: mouad3at3at
  jpa:
    hibernate:
      ddl-auto: update
```

## Intégrations futures

- API Gateway (Spring Cloud Gateway) - pour router les requêtes
- Eureka Service Discovery - pour enregistrement/découverte des services
- Message queue (RabbitMQ/Kafka) - pour notifications asynchrones
- JWT validation middleware - pour vérifier les tokens des utilisateurs
- External service calls - pour récupérer les données des écrans et utilisateurs

## Notes de développement

- Utilise Lombok pour réduire le boilerplate code
- Dependency Injection via `@RequiredArgsConstructor`
- Transactions gérées via `@Transactional`
- Validation de données via exceptions RuntimeException (à améliorer avec custom exceptions)
- Tests unitaires avec JUnit 5 et Mockito
- Tests d'intégration avec `@SpringBootTest` et MockMvc
