# SGEPD - Système de Gestion des Écrans Publicitaires Digitaux

## Vue d'ensemble

Application de gestion de panneaux publicitaires digitaux (écrans, clients, tickets, emplacements).
Architecture **microservices** Spring Boot + React/Vite, entièrement containerisée sous Docker.

---

## Stack Technologique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite + Axios + React Router |
| Backend | Spring Boot 3.5 (Java 17) - Microservices |
| Gateway | Spring Cloud Gateway (reactive) |
| Auth | JWT (JJWT 0.11.5) + BCrypt |
| Base de données | PostgreSQL 16 (une DB par service) |
| Cache | Redis |
| Containerisation | Docker + Docker Compose |
| Reverse proxy | Nginx (pour le frontend en prod) |

---

## Architecture Microservices

```
Browser (React SPA)
  http://127.0.0.1:5173
        |
        | HTTP requests to API
        v
  API Gateway (port 8090)       <-- SEUL point d'entrée du backend
  ./api-gateway
  Spring Cloud Gateway + JWT AuthenticationFilter
        |
        |-- /api/auth/**    -->  auth-service     :8080  (DB: auth_db)
        |-- /api/users/**   -->  user-service     :8081  (DB: user_db)
        |-- /api/screens/** -->  screen-service   :8082  (DB: screen_db)
        |-- /api/tickets/** -->  ticket-service   :8083  (DB: ticket_db)
        |-- /api/assignments/** --> assignment-service :8084 (DB: assignment_db)
        |-- /api/dashboard/**   --> dashboard-service  :8085 (agrège d'autres services)
        |-- /api/clients/**     --> client-service     :8086 (DB: client_db)
        |-- /api/locations/**   --> location-service   :8088 (DB: location_db) + OSM Nominatim
        
  Infrastructure:
        PostgreSQL :5433 (host) / :5432 (interne Docker)
        Redis      :6379
```

---

## Services Backend

### 1. `auth-service` (port 8080)
- **Rôle** : Authentification, gestion des tokens JWT
- **DB** : `auth_db`
- **Endpoints publics** : `/api/auth/**` (login, register)
- **Sécurité** : Spring Security stateless + JwtAuthFilter
- **Au démarrage** : Force reset du mot de passe admin (`admin / admin123`)
- **Dépendances** : PostgreSQL + Redis

### 2. `user-service` (port 8081)
- **Rôle** : CRUD des utilisateurs du système
- **DB** : `user_db`
- **Sécurité** : JWT requis (validé par la Gateway)

### 3. `screen-service` (port 8082)
- **Rôle** : Gestion des écrans publicitaires
- **DB** : `screen_db`
- **Sécurité** : JWT requis

### 4. `ticket-service` (port 8083)
- **Rôle** : Gestion des tickets de maintenance/incidents
- **DB** : `ticket_db`
- **Sécurité** : JWT requis

### 5. `assignment-service` (port 8084)
- **Rôle** : Affectation d'écrans aux clients/emplacements
- **DB** : `assignment_db`
- **Sécurité** : JWT requis

### 6. `dashboard-service` (port 8085)
- **Rôle** : Agrège les données de screen, ticket, client, assignment
- **Pas de DB propre** (appelle les autres services en interne)
- **URLs internes** :
  - screen-service:8082
  - ticket-service:8083
  - client-service:8086
  - assignment-service:8084

### 7. `client-service` (port 8086)
- **Rôle** : Gestion des clients (annonceurs)
- **DB** : `client_db`
- **Note** : Port 8086 pour éviter conflit

### 8. `location-service` (port 8088)
- **Rôle** : Gestion des emplacements géographiques
- **DB** : `location_db`
- **External API** : OpenStreetMap Nominatim pour géocodage

### 9. `api-gateway` (port 8090)
- **Rôle** : Point d'entrée unique, routing, validation JWT, CORS
- **Framework** : Spring Cloud Gateway (reactive/WebFlux)
- **JWT** : Valide le token avant de router la requête
- **Headers injectés** : `X-Username`, `X-User-Role` (transmis aux microservices)
- **Route publique** : `/api/auth/**` (sans JWT)
- **CORS autorisés** : `http://localhost:5173` et `http://127.0.0.1:5173`

---

## Frontend (React + Vite)

### Structure
```
frontend/src/
├── api.js              # Axios instance, baseURL = http://127.0.0.1:8090/api
├── App.jsx             # Router principal (React Router v6)
├── context/
│   └── AuthContext.jsx # Contexte global auth (JWT stocké en localStorage)
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx         # Dashboard technicien
│   ├── AdminDashboard.jsx    # Dashboard admin
│   ├── ScreenManagement.jsx  # CRUD écrans
│   ├── ClientManagement.jsx  # CRUD clients
│   ├── TicketManagement.jsx  # CRUD tickets
│   └── LocationManagement.jsx # CRUD emplacements
└── components/
    ├── Layout.jsx
    ├── ScreenFormModal.jsx
    ├── ClientFormModal.jsx
    ├── TicketFormModal.jsx
    └── LocationFormModal.jsx
```

### Routes React
| Route | Page | Protection |
|-------|------|-----------|
| `/login` | Login.jsx | Publique |
| `/register` | Register.jsx | Publique |
| `/dashboard` | Dashboard.jsx | JWT requis |
| `/admin-dashboard` | AdminDashboard.jsx | JWT requis |
| `/screens` | ScreenManagement.jsx | JWT requis |
| `/clients` | ClientManagement.jsx | JWT requis |
| `/tickets` | TicketManagement.jsx | JWT requis |
| `/locations` | LocationManagement.jsx | JWT requis |

### Appels API
- Toutes les requêtes passent par `http://127.0.0.1:8090/api` (la Gateway)
- Le token JWT est stocké dans `localStorage` sous la clé `token`
- Axios interceptor ajoute automatiquement `Authorization: Bearer <token>` à chaque requête

---

## Sécurité

### Flux d'authentification
```
1. POST /api/auth/login  -->  auth-service (public, sans JWT)
   Body: { username, password }
   Réponse: { token: "eyJhbGci..." }

2. Stockage du token dans localStorage['token']

3. Toutes les requêtes suivantes:
   Header: Authorization: Bearer eyJhbGci...

4. La Gateway valide le JWT avant de router
   - Si invalide --> 401 Unauthorized
   - Si valide   --> route vers le microservice + injecte X-Username, X-User-Role
```

### JWT
- **Secret** : `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970`
- **Expiration** : 86400000 ms (24h)
- **Algorithme** : HS256 (HMAC-SHA256)

### Compte admin par défaut
- **Username** : `admin`
- **Password** : `admin123`
- **Rôle** : `ADMIN`
- Réinitialisé automatiquement à chaque redémarrage de l'`auth-service`

---

## Infrastructure Docker

### Bases de données PostgreSQL
| Base | Service | Usage |
|------|---------|-------|
| `auth_db` | auth-service | Utilisateurs, tokens |
| `user_db` | user-service | Profils utilisateurs |
| `screen_db` | screen-service | Écrans publicitaires |
| `ticket_db` | ticket-service | Tickets incidents |
| `assignment_db` | assignment-service | Affectations |
| `client_db` | client-service | Clients annonceurs |
| `location_db` | location-service | Emplacements géo |

- **Host port** : `5433` (interne: `5432`)
- **User** : `postgres` / **Password** : `mouad3at3at`
- Init auto via `./init-db/init.sql`

### Réseau Docker
- Tous les services sont sur le réseau `app-network` (bridge)
- Communication inter-services via noms DNS Docker : `http://auth-service:8080`, etc.
- Volume persistant : `sgepd-db-data`

---

## Démarrage (Docker - Commande unique)

### Prérequis
- Docker Desktop installé et lancé
- Java 17+ (JDK) pour la compilation Maven
- Node.js (non requis si on utilise Docker uniquement pour le frontend)

### Lancer l'application
```powershell
# Depuis la racine du projet
.\start-docker.bat
# ou
.\start-docker.ps1
```

### Ce que fait le script `start-docker.ps1`
1. Vérifie/démarre Docker Desktop
2. Compile tous les microservices Java : `.\mvnw clean package -DskipTests`
3. Démarre PostgreSQL + Redis : `docker compose up -d postgres-db redis`
4. Attend que PostgreSQL soit prêt (`pg_isready`)
5. Crée les bases de données si inexistantes
6. Lance tous les services : `docker compose up --build -d`
7. Affiche le tableau de bord des conteneurs en cours

### Accès
| Service | URL |
|---------|-----|
| **Frontend** | http://127.0.0.1:5173 |
| **API Gateway** | http://127.0.0.1:8090 |
| **PostgreSQL** | localhost:5433 |
| **Redis** | localhost:6379 |

> ⚠️ **Important Windows/WSL2** : Utiliser `127.0.0.1` et NON `localhost`.
> `localhost` se résout en IPv6 (`::1`) sur Windows + Docker Desktop, ce qui provoque `ERR_CONNECTION_RESET`.

### Commandes utiles
```powershell
# Voir les logs de tous les services
docker compose logs -f

# Logs d'un service spécifique
docker logs auth-service
docker logs sgepd-project-gateway-service-1

# Arrêter tout
docker compose down

# Rebuild d'un seul service (ex: après modif du code)
.\mvnw clean package -pl api-gateway -DskipTests
docker compose up --build -d gateway-service

# Rebuild du frontend
docker compose up --build -d frontend

# Rebuild complet
.\mvnw clean package -DskipTests
docker compose up --build -d
```

---

## Structure des dossiers

```
SGEPD-Project/
├── api-gateway/            # Gateway principale (Spring Cloud Gateway + JWT)
│   ├── src/main/java/com/digitello/
│   │   ├── filter/AuthenticationFilter.java  # Filtre JWT Gateway
│   │   ├── filter/RouteValidator.java        # Routes publiques vs sécurisées
│   │   └── util/JwtUtil.java                 # Validation JWT
│   ├── src/main/resources/application.yaml   # Config routes + CORS
│   └── Dockerfile
├── auth-service/           # Service d'authentification
├── user-service/           # Gestion des utilisateurs
├── screen-service/         # Gestion des écrans
├── ticket-service/         # Gestion des tickets
├── assignment-service/     # Gestion des affectations
├── dashboard-service/      # Agrégateur de données
├── client-service/         # Gestion des clients
├── location-service/       # Gestion des emplacements (+ OSM)
├── gateway-service/        # ANCIEN gateway (skeleton vide, NON utilisé)
├── frontend/               # React + Vite SPA
│   ├── src/
│   ├── Dockerfile          # Multi-stage: node build + nginx serve
│   └── vite.config.js
├── init-db/
│   └── init.sql            # Création automatique des 7 bases de données
├── docker-compose.yml      # Orchestration complète
├── pom.xml                 # POM parent Maven (build tous les services)
├── mvnw / mvnw.cmd         # Maven wrapper
├── start-docker.ps1        # Script de démarrage tout-en-un (PowerShell)
└── start-docker.bat        # Wrapper CMD pour start-docker.ps1
```

---

## Points importants / Gotchas

1. **`gateway-service/` vs `api-gateway/`** : Il existe deux dossiers gateway.
   - `gateway-service/` = squelette vide (NE PAS UTILISER). Ne possède pas `AuthenticationFilter`.
   - `api-gateway/` = implémentation complète avec JWT. **C'est celui utilisé.**
   - `docker-compose.yml` pointe sur `./api-gateway` pour le service `gateway-service`.

2. **Ports** : Le frontend React en production (Docker) tourne sur Nginx port 80, mappé vers `5173` côté hôte.

3. **CORS** : Configuré uniquement au niveau de l'`api-gateway`. Les microservices n'ont pas besoin de config CORS car ils ne sont pas accédés directement depuis le browser.

4. **JWT Secret** : Le même secret est partagé entre `auth-service` (génération) et `api-gateway` (validation). Il est configuré via `APP_JWT_SECRET` dans les variables d'environnement Docker.

5. **dashboard-service** : N'a pas de base de données propre. Il appelle directement les autres services via HTTP interne Docker (`http://screen-service:8082`, etc.).

6. **location-service** : Utilise l'API externe OpenStreetMap Nominatim pour le géocodage d'adresses.

---

## Variables d'environnement importantes

| Variable | Valeur | Service |
|----------|--------|---------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://postgres-db:5432/<nom_db>` | Tous les services avec DB |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Tous |
| `SPRING_DATASOURCE_PASSWORD` | `mouad3at3at` | Tous |
| `APP_JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | Tous |
| `SPRING_REDIS_HOST` | `redis` | auth-service |
| `OSM_NOMINATIM_URL` | `https://nominatim.openstreetmap.org` | location-service |
| `SPRING_CLOUD_COMPATIBILITY_VERIFIER_ENABLED` | `false` | gateway-service |
