# SGEPD - Start All Services

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "      SGEPD - DEMARRAGE DE L'APPLICATION      " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verification et demarrage de Docker
Write-Host "[1/4] Verification de Docker Desktop..." -ForegroundColor Yellow
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
        Write-Host "[ERREUR] Impossible de demarrer Docker automatiquement. Veuillez lancer Docker Desktop manuellement." -ForegroundColor Red
        exit 1
    }
}
Write-Host "[OK] Docker est en cours d execution." -ForegroundColor Green
Write-Host ""

# 2. Demarrage des conteneurs
Write-Host "[2/4] Demarrage des conteneurs PostgreSQL et Redis..." -ForegroundColor Yellow
docker compose up -d

Write-Host "En attente du demarrage de PostgreSQL..." -ForegroundColor Yellow
$elapsed_db = 0
do {
    Start-Sleep -Seconds 3
    $elapsed_db += 3
    $dbCheck = docker exec sgepd-postgres pg_isready -U postgres 2>&1
    Write-Host "En attente de PostgreSQL... ($elapsed_db/30s)"
} while ($LastExitCode -ne 0 -and $elapsed_db -lt 30)

if ($LastExitCode -ne 0) {
    Write-Host "[ATTENTION] PostgreSQL prend du temps a repondre. Tentative de creation des bases de donnees..." -ForegroundColor Yellow
} else {
    Write-Host "[OK] PostgreSQL est pret." -ForegroundColor Green
}

# Creation des bases de donnees si elles n existent pas
Write-Host "Creation des bases de donnees si elles n existent pas..." -ForegroundColor Yellow
$dbs = @("auth_db", "user_db", "ticket_db", "screen_db", "client_db", "location_db")
foreach ($db in $dbs) {
    docker exec -i sgepd-postgres psql -U postgres -c "CREATE DATABASE $db;" 2>$null
}
Write-Host "[OK] Toutes les bases de donnees sont configurees." -ForegroundColor Green
Write-Host ""

# 3. Installation et demarrage du Frontend
Write-Host "[3/4] Mise a jour des dependances frontend..." -ForegroundColor Yellow
Push-Location frontend
npm install
Pop-Location
Write-Host ""

Write-Host "> Lancement du frontend sur http://localhost:5173..." -ForegroundColor Green
Start-Process cmd.exe -ArgumentList "/k", "npm run dev" -WorkingDirectory frontend

# 4. Lancement des Microservices Backend
Write-Host "[4/4] Lancement des microservices backend dans des fenetres separees..." -ForegroundColor Yellow
Write-Host ""

$services = @("user-service", "auth-service", "screen-service", "client-service", "ticket-service", "location-service", "api-gateway")

foreach ($service in $services) {
    Write-Host "> Lancement de $service..." -ForegroundColor Green
    Start-Process cmd.exe -ArgumentList "/k", ".\mvnw.cmd spring-boot:run" -WorkingDirectory $service
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  [OK] Tous les services ont ete lances !     " -ForegroundColor Green
Write-Host "  Les consoles individuelles se sont ouvertes." -ForegroundColor Green
Write-Host "  Accedez au frontend ici : http://localhost:5173" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan
