package com.digitello.auth_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuration de la sécurité pour le microservice d'authentification.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Définit la chaîne de filtres de sécurité.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Désactivé car on utilise des tokens JWT
            .sessionManagement(session ->
                // Pas de session côté serveur (Stateless), chaque requête doit fournir son token
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Les endpoints de login et register doivent être accessibles sans token
                .requestMatchers("/api/auth/**").permitAll()
                // Toutes les autres requêtes nécessitent une authentification
                .anyRequest().authenticated()
            );
        return http.build();
    }

    /**
     * Bean pour le hachage des mots de passe.
     * Utilise l'algorithme BCrypt.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}