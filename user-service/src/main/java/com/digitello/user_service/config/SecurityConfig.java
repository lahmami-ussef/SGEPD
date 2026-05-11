package com.digitello.user_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/users/hello").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/users/**").permitAll() // Lecture autorisée pour l'instant
                .requestMatchers("/api/users/**").authenticated() // POST, PUT, DELETE protégés
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
