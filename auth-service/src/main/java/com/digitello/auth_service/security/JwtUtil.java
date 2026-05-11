package com.digitello.auth_service.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

/**
 * Utilitaire pour la gestion des JSON Web Tokens (JWT).
 * Cette classe permet de créer, valider et extraire des informations des tokens.
 */
@Component
public class JwtUtil {

    // Clé secrète récupérée depuis application.properties pour signer le token
    @Value("${app.jwt.secret}")
    private String secret;

    // Durée de validité du token (en millisecondes)
    @Value("${app.jwt.expiration}")
    private long expiration;

    /**
     * Génère une clé de signature à partir de la chaîne secrète.
     */
    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Génère un nouveau token JWT pour un utilisateur.
     * @param username Le nom d'utilisateur (subject).
     * @param role Le rôle de l'utilisateur (claim personnalisé).
     * @return Le token compacté.
     */
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username) // Identifiant principal
                .claim("role", role)  // Donnée personnalisée injectée dans le payload
                .setIssuedAt(new Date()) // Date de création
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // Date d'expiration
                .signWith(getKey(), SignatureAlgorithm.HS256) // Signature avec l'algorithme HMAC SHA-256
                .compact();
    }

    /**
     * Extrait le nom d'utilisateur (subject) contenu dans le token.
     */
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Extrait le rôle de l'utilisateur contenu dans les claims du token.
     */
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    /**
     * Vérifie si un token est valide (signature correcte et non expiré).
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token); // Si l'analyse réussit, le token est valide
            return true;
        } catch (JwtException e) {
            // En cas d'erreur (expiration, signature invalide, etc.), on retourne false
            return false;
        }
    }

    /**
     * Analyse le token et récupère l'ensemble des données (Claims).
     * @throws JwtException si le token est invalide ou expiré.
     */
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey()) // On utilise la même clé pour vérifier la signature
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}