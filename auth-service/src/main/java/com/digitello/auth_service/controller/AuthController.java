package com.digitello.auth_service.controller;

import com.digitello.auth_service.dto.*;
import com.digitello.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.digitello.auth_service.entity.User;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur gérant les requêtes d'authentification (Login, Inscription).
 * Toutes les routes ici sont préfixées par /api/auth.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint pour la connexion.
     * @param request Contient le username et le password.
     * @return Un token JWT et les infos de l'utilisateur en cas de succès.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("📩 REQUETE LOGIN RECUE DANS LE CONTROLEUR");
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Endpoint pour la création d'un nouveau compte (Identité).
     * @param request Contient username, password, email et role.
     * @return Un token JWT pour une connexion immédiate après inscription.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }

    @GetMapping("/pending")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public List<User> getPendingUsers() {
        return authService.getPendingUsers();
    }

    @PostMapping("/approve/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public void approveUser(@PathVariable Long id) {
        authService.approveUser(id);
    }

    @PostMapping("/reject/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public void rejectUser(@PathVariable Long id) {
        authService.rejectUser(id);
    }

    @GetMapping("/users")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        authService.updateUserRole(id, role);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}