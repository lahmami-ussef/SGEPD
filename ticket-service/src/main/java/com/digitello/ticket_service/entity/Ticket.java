package com.digitello.ticket_service.entity;

import lombok.*;// lombok est une bibliothèque qui réduit le code répétitif.
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity // tell JPA to manage this entity (store in database)
@Table(name = "tickets") // table name in the database is tickets
@Data // generate getters and setters 
@Builder // allows you to create objects 
@NoArgsConstructor // 
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_number", unique = true, nullable = false)
    private String ticketNumber;

    @Column(name = "screen_id", nullable = false)
    private Long screenId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private TicketPriority priority;

    @Column(name = "problem_type")
    private String problemType;  // panne matérielle, connectivité, player, etc.

    @Column(name = "assigned_to")
    private Long assignedToTechnicianId;

    @Column(name = "created_by")
    private Long createdByUserId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;  // When technician starts working

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;  // When issue is resolved

    @Column(name = "closed_at")
    private LocalDateTime closedAt;  // When ticket is closed/archived

    @Column(name = "intervention_report", columnDefinition = "TEXT")
    private String interventionReport;  // Actions taken, parts replaced, etc.

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate // after the modification 
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
