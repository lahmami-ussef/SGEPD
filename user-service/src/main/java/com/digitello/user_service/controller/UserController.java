package com.digitello.user_service.controller;

import com.digitello.user_service.dto.CreateUserRequest;
import com.digitello.user_service.dto.UserDTO;
import com.digitello.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des utilisateurs.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Permet les requêtes depuis votre application React
public class UserController {

    private final UserService userService;

    @GetMapping("/hello")
    public String hello() {
        return "Hello ! Le service est bien accessible.";
    }

    /**
     * Endpoint pour créer un nouvel utilisateur.
     * @param request Les données de l'utilisateur.
     * @return L'utilisateur créé.
     */
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
        return ResponseEntity.status(201).body(userService.createUser(request));
    }

    /**
     * Endpoint pour lister tous les utilisateurs.
     */
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * Endpoint pour récupérer un utilisateur spécifique.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /**
     * Endpoint pour supprimer un utilisateur.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
