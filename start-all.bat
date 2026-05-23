@echo off
chcp 65001 > nul
echo ==============================================
echo      SGEPD - DEMARRAGE DE L'APPLICATION       
echo ==============================================

:: 1. Verification et demarrage de Docker
echo [1/4] Verification de Docker Desktop...
docker ps >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✔ Docker est deja en cours d'execution.
    goto docker_ready
)

echo ▶ Demarrage de Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo En attente du demarrage du moteur Docker (max 2 min)...
set /a elapsed=0
:loop_docker
timeout /t 5 /nobreak >nul
set /a elapsed+=5
docker ps >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✔ Docker Desktop a demarre avec succes.
    goto docker_ready
)
echo En attente du demarrage de Docker... (%elapsed%/120s)
if %elapsed% geq 120 (
    echo ❌ Impossible de demarrer Docker automatiquement. Veuillez lancer Docker Desktop manuellement.
    pause
    exit /b 1
)
goto loop_docker

:docker_ready

:: 2. Demarrage des conteneurs
echo [2/4] Demarrage des conteneurs PostgreSQL et Redis...
docker compose up -d

echo En attente du demarrage de PostgreSQL...
set /a elapsed_db=0
:loop_db
timeout /t 3 /nobreak >nul
docker exec sgepd-postgres pg_isready -U postgres >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✔ PostgreSQL est pret.
    goto db_ready
)
set /a elapsed_db+=3
echo En attente de PostgreSQL... (%elapsed_db%/30s)
if %elapsed_db% geq 30 (
    echo ⚠️ PostgreSQL prend du temps a repondre. Tentative de creation des bases de donnees...
    goto db_ready
)
goto loop_db

:db_ready
echo Creation des bases de donnees si elles n'existent pas...
docker exec -i sgepd-postgres psql -U postgres -c "CREATE DATABASE auth_db;" >nul 2>&1
docker exec -i sgepd-postgres psql -U postgres -c "CREATE DATABASE user_db;" >nul 2>&1
docker exec -i sgepd-postgres psql -U postgres -c "CREATE DATABASE ticket_db;" >nul 2>&1
docker exec -i sgepd-postgres psql -U postgres -c "CREATE DATABASE screen_db;" >nul 2>&1
docker exec -i sgepd-postgres psql -U postgres -c "CREATE DATABASE client_db;" >nul 2>&1
docker exec -i sgepd-postgres psql -U postgres -c "CREATE DATABASE location_db;" >nul 2>&1
echo ✔ Toutes les bases de donnees sont configurees.

:: 3. Installation et demarrage du Frontend
echo [3/4] Mise a jour des dependances frontend...
cd frontend
call npm install
cd ..

echo ▶ Lancement du frontend sur http://localhost:5173...
start "Frontend (React)" cmd /c "cd frontend && npm run dev"

:: 4. Lancement des Microservices Backend
echo [4/4] Lancement des microservices backend dans des fenetres separees...

echo ▶ Lancement de user-service...
start "user-service" cmd /c "cd user-service && mvnw.cmd spring-boot:run"
timeout /t 2 /nobreak >nul

echo ▶ Lancement de auth-service...
start "auth-service" cmd /c "cd auth-service && mvnw.cmd spring-boot:run"
timeout /t 2 /nobreak >nul

echo ▶ Lancement de screen-service...
start "screen-service" cmd /c "cd screen-service && mvnw.cmd spring-boot:run"
timeout /t 2 /nobreak >nul

echo ▶ Lancement de client-service...
start "client-service" cmd /c "cd client-service && mvnw.cmd spring-boot:run"
timeout /t 2 /nobreak >nul

echo ▶ Lancement de ticket-service...
start "ticket-service" cmd /c "cd ticket-service && mvnw.cmd spring-boot:run"
timeout /t 2 /nobreak >nul

echo ▶ Lancement de location-service...
start "location-service" cmd /c "cd location-service && mvnw.cmd spring-boot:run"
timeout /t 2 /nobreak >nul

echo ▶ Lancement de api-gateway...
start "api-gateway" cmd /c "cd api-gateway && mvnw.cmd spring-boot:run"

echo ==============================================
echo  ✔ Tous les services ont ete lances !
echo  Les consoles individuelles se sont ouvertes.
echo  Accedez au frontend ici : http://localhost:5173
echo ==============================================
