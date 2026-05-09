package com.digitello.screen_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "screens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Screen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String brand;
    private String model;
    private String size;
    private String resolution;
    private String os;
    private String osVersion;

    // WiFi
    private String ssid;
    private String macAddress;
    private String wifiSignal;
    private LocalDateTime lastConnection;

    // Player
    private String playerModel;
    private String playerVersion;
    private String playerStorage;

    // Localisation
    private String city;
    private String address;
    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = Status.ACTIF;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Status {
        ACTIF, EN_PANNE, EN_MAINTENANCE
    }
}