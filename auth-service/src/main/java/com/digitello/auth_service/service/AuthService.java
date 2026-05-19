package com.digitello.auth_service.service;

import com.digitello.auth_service.dto.*;
import com.digitello.auth_service.entity.User;
import com.digitello.auth_service.repository.UserRepository;
import com.digitello.auth_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final WebClient.Builder webClientBuilder;

    @Override
    public void run(String... args) {
        System.out.println("=================================================");
        System.out.println("🚀 FORCE RESET ADMIN AU DEMARRAGE...");
        try {
            User admin = userRepository.findByUsername("admin").orElse(
                User.builder().username("admin").email("admin@sgepd.com").role(User.Role.ADMIN).build()
            );
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println("✅ ADMIN REINITIALISÉ : admin / admin123");
        } catch (Exception e) {
            System.err.println("❌ ERREUR INIT ADMIN : " + e.getMessage());
        }
        System.out.println("=================================================");
    }

    public Map<String, String> login(LoginRequest request) {
        String username = request.getUsername().toLowerCase().trim();
        System.out.println("🔑 --- DEBUT TENTATIVE LOGIN ---");
        System.out.println("👤 Utilisateur : [" + username + "]");

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    System.err.println("❌ UTILISATEUR NON TROUVÉ EN BASE");
                    return new RuntimeException("Utilisateur non trouvé");
                });

        boolean isPasswordMatch = passwordEncoder.matches(request.getPassword(), user.getPassword());
        System.out.println("🔐 Comparaison BCrypt : " + (isPasswordMatch ? "SUCCÈS ✅" : "ÉCHEC ❌"));

        if (!isPasswordMatch) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        if (!user.isEnabled()) {
            System.err.println("❌ COMPTE DÉSACTIVÉ");
            throw new RuntimeException("Compte en attente de validation");
        }

        System.out.println("✨ LOGIN RÉUSSI POUR : " + username);
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        
        Map<String, String> response = Map.of(
            "token", token,
            "username", user.getUsername(),
            "role", user.getRole().name()
        );
        System.out.println("📦 REPONSE GENEREE : " + response);
        return response;
    }

    public Object register(RegisterRequest request) {
        User user = User.builder()
                .username(request.getUsername().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(request.getRole() != null ? request.getRole() : User.Role.CLIENT)
                .enabled(request.getRole() == User.Role.ADMIN)
                .build();

        User savedUser = userRepository.save(user);
        try {
            webClientBuilder.build().post()
                    .uri("http://localhost:8085/api/users")
                    .bodyValue(Map.of("username", savedUser.getUsername(), "fullName", savedUser.getUsername(), "email", savedUser.getEmail(), "role", savedUser.getRole().name()))
                    .retrieve().bodyToMono(Void.class).block();
        } catch (Exception e) {
            System.err.println("⚠️ Sync non effectuée : " + e.getMessage());
        }
        return Map.of("message", "Compte créé");
    }

    public List<User> getPendingUsers() {
        return userRepository.findAll().stream().filter(u -> !u.isEnabled()).toList();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @org.springframework.transaction.annotation.Transactional
    public void approveUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(true);
        userRepository.save(user);
    }

    @org.springframework.transaction.annotation.Transactional
    public void rejectUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        String username = user.getUsername();
        
        // Supprimer d'abord de auth_db
        userRepository.delete(user);
        
        // Supprimer de user_db via WebClient
        try {
            webClientBuilder.build().delete()
                    .uri("http://localhost:8085/api/users/username/" + username)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .timeout(java.time.Duration.ofSeconds(5))
                    .block();
        } catch (Exception e) {
            System.err.println("⚠️ Impossible de synchroniser le rejet dans user-service : " + e.getMessage());
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void updateUserRole(Long id, String role) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        User.Role oldRole = user.getRole();
        user.setRole(User.Role.valueOf(role));
        userRepository.save(user);
        
        // Appeler user-service via WebClient pour synchroniser
        try {
            webClientBuilder.build().put()
                    .uri("http://localhost:8085/api/users/username/" + user.getUsername() + "/role?role=" + role)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .timeout(java.time.Duration.ofSeconds(5))
                    .block();
        } catch (Exception e) {
            // Annuler la modification locale en cas d'échec de la synchronisation
            user.setRole(oldRole);
            userRepository.save(user);
            throw new RuntimeException("Erreur de synchronisation avec user-service. Modification annulée.", e);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        String username = user.getUsername();
        
        // Supprimer de auth_db
        userRepository.delete(user);
        
        // Supprimer de user_db via WebClient
        try {
            webClientBuilder.build().delete()
                    .uri("http://localhost:8085/api/users/username/" + username)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .timeout(java.time.Duration.ofSeconds(5))
                    .block();
        } catch (Exception e) {
            System.err.println("⚠️ Impossible de synchroniser la suppression dans user-service : " + e.getMessage());
        }
    }
}