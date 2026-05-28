package com.digitello.ticket_service.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum TicketPriority {
    BASSE, MOYENNE, HAUTE, CRITIQUE;

    // ✅ Accepte LOW/MEDIUM/HIGH/CRITICAL ET BASSE/MOYENNE/HAUTE/CRITIQUE
    @JsonCreator
    public static TicketPriority fromString(String value) {
        return switch (value.toUpperCase()) {
            case "LOW",      "BASSE"    -> BASSE;
            case "MEDIUM",   "MOYENNE"  -> MOYENNE;
            case "HIGH",     "HAUTE"    -> HAUTE;
            case "CRITICAL", "CRITIQUE" -> CRITIQUE;
            default -> throw new IllegalArgumentException("Priorité invalide: " + value);
        };
    }
}