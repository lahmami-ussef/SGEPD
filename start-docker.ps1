# SGEPD - Start All Services in Docker Compose
# Single-command startup

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "      SGEPD - DEMARRAGE COMPLET VIA DOCKER    " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verification et demarrage de Docker
Write-Host "[1/5] Verification de Docker Desktop..." -ForegroundColor Yellow
$dockerCheck = docker ps 2>&1
if ($LastExitCode -ne 0) {
    Write-Host "> Demarrage de Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    
    Write-Host "En attente du demarrage du moteur Docker..." -ForegroundColor Yellow
    $elapsed = 0
    do {
        Start-Sleep -Seconds 5
        $elapsed += 5
        $dockerCheck = docker ps 2>&1
        Write-Host "En attente du demarrage de Docker... ($elapsed/120s)"
    } while ($LastExitCode -ne 0 -and $elapsed -lt 120)
    
    if ($LastExitCode -ne 0) {
        Write-Host "[ERREUR] Impossible de demarrer Docker automatiquement. Veuillez lancer Docker Desktop." -ForegroundColor Red
        exit 1
    }
}
Write-Host "[OK] Docker est pret." -ForegroundColor Green
Write-Host ""

# 2. Compilation des microservices Java
Write-Host "[2/5] Compilation des microservices Java avec Maven..." -ForegroundColor Yellow
& .\mvnw.cmd clean package -DskipTests
if ($LastExitCode -ne 0) {
    Write-Host "[ERREUR] La compilation des microservices a echoue. Verifiez les erreurs ci-dessus." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Compilation reussie." -ForegroundColor Green
Write-Host ""

# 3. Demarrage des conteneurs de base (Postgres & Redis)
Write-Host "[3/5] Demarrage de PostgreSQL et Redis..." -ForegroundColor Yellow
docker compose up -d postgres-db redis

Write-Host "En attente du demarrage de PostgreSQL..." -ForegroundColor Yellow
$elapsed_db = 0
do {
    Start-Sleep -Seconds 3
    $elapsed_db += 3
    $dbCheck = docker exec sgepd-postgres pg_isready -U postgres 2>&1
    Write-Host "En attente de PostgreSQL... ($elapsed_db/30s)"
} while ($LastExitCode -ne 0 -and $elapsed_db -lt 30)

if ($LastExitCode -ne 0) {
    Write-Host "[ATTENTION] PostgreSQL prend du temps a repondre. Tentative de configuration des bases..." -ForegroundColor Yellow
} else {
    Write-Host "[OK] PostgreSQL est pret." -ForegroundColor Green
}

# Creation des bases de donnees si elles n'existent pas
Write-Host "Configuration des bases de donnees..." -ForegroundColor Yellow
$dbs = @("auth_db", "user_db", "ticket_db", "screen_db", "client_db", "location_db", "assignment_db")
foreach ($db in $dbs) {
    docker exec -i sgepd-postgres psql -U postgres -c "CREATE DATABASE $db;" 2>$null
}
Write-Host "[OK] Bases de donnees pretes." -ForegroundColor Green
Write-Host ""

# 4. Demarrage de tous les services restants dans Docker
Write-Host "[4/5] Demarrage de tous les microservices et du frontend dans Docker..." -ForegroundColor Yellow
docker compose up --build -d

if ($LastExitCode -ne 0) {
    Write-Host "[ERREUR] Le demarrage de Docker Compose a echoue." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Tous les conteneurs sont lances en arriere-plan." -ForegroundColor Green
Write-Host ""

# 5. Synthese et status
Write-Host "[5/5] Verification des services en cours d'execution..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  [OK] L'application SGEPD est demarree en arriere-plan ! " -ForegroundColor Green
Write-Host "  - Accedez au Frontend : http://localhost:5173" -ForegroundColor Green
Write-Host "  - Passerelle Gateway : http://localhost:8090" -ForegroundColor Green
Write-Host "  - Base PostgreSQL    : localhost:5433" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Pour voir les logs : docker compose logs -f" -ForegroundColor Yellow
Write-Host "Pour arreter l'application : docker compose down" -ForegroundColor Yellow
