package com.digitello.ticket_service.dto;

import com.digitello.ticket_service.entity.TicketPriority;
import com.digitello.ticket_service.entity.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String ticketNumber;
    private Long screenId;
    private String description;
    private TicketStatus status;
    private TicketPriority priority;
    private String problemType;
    private Long assignedToTechnicianId;
    private Long createdByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime startedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private String interventionReport;
}
