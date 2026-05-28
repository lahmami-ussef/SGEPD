package com.digitello.ticket_service.controller;

import com.digitello.ticket_service.dto.*;
import com.digitello.ticket_service.entity.TicketStatus;
import com.digitello.ticket_service.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    /**
     * Create a new intervention ticket (CU-08)
     */
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@RequestBody CreateTicketRequest request) {
        var ticket = ticketService.createTicket(
                request.getScreenId(),
                request.getProblemType(),
                request.getDescription(),
                request.getPriority(),
                request.getCreatedByUserId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(ticket));
    }

    /**
     * Get ticket by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(ticket -> ResponseEntity.ok(mapToResponse(ticket)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get ticket by ticket number
     */
    @GetMapping("/number/{ticketNumber}")
    public ResponseEntity<TicketResponse> getTicketByNumber(@PathVariable String ticketNumber) {
        return ticketService.getTicketByNumber(ticketNumber)
                .map(ticket -> ResponseEntity.ok(mapToResponse(ticket)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get all tickets for a screen
     */
    @GetMapping("/screen/{screenId}")
    public ResponseEntity<List<TicketResponse>> getTicketsByScreen(@PathVariable Long screenId) {
        List<TicketResponse> tickets = ticketService.getTicketsByScreen(screenId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get open tickets for a screen
     */
    @GetMapping("/screen/{screenId}/open")
    public ResponseEntity<List<TicketResponse>> getOpenTicketsByScreen(@PathVariable Long screenId) {
        List<TicketResponse> tickets = ticketService.getOpenTicketsByScreen(screenId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get all tickets by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TicketResponse>> getTicketsByStatus(@PathVariable TicketStatus status) {
        List<TicketResponse> tickets = ticketService.getTicketsByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get tickets assigned to a technician (CU-10)
     */
    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<TicketResponse>> getTicketsByTechnician(@PathVariable Long technicianId) {
        List<TicketResponse> tickets = ticketService.getTicketsByTechnician(technicianId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get active tickets assigned to a technician
     */
    @GetMapping("/technician/{technicianId}/active")
    public ResponseEntity<List<TicketResponse>> getActiveTicketsByTechnician(@PathVariable Long technicianId) {
        List<TicketResponse> tickets = ticketService.getActiveTicketsByTechnician(technicianId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get unassigned open tickets
     */
    @GetMapping("/unassigned")
    public ResponseEntity<List<TicketResponse>> getUnassignedOpenTickets() {
        List<TicketResponse> tickets = ticketService.getUnassignedOpenTickets()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }

    /**
     * Assign ticket to a technician (CU-10)
     */
    @PostMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicketToTechnician(
            @PathVariable Long id,
            @RequestBody AssignTicketRequest request) {
        try {
            var ticket = ticketService.assignTicketToTechnician(id, request.getTechnicianId());
            return ResponseEntity.ok(mapToResponse(ticket));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Start working on a ticket (CU-09: Ouvert → En cours)
     */
    @PutMapping("/{id}/start")
    public ResponseEntity<TicketResponse> startTicket(@PathVariable Long id) {
        try {
            var ticket = ticketService.startTicket(id);
            return ResponseEntity.ok(mapToResponse(ticket));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Mark ticket as resolved (CU-09: En cours → Résolu)
     */
    @PutMapping("/{id}/resolve")
    public ResponseEntity<TicketResponse> resolveTicket(
            @PathVariable Long id,
            @RequestBody ResolveTicketRequest request) {
        try {
            var ticket = ticketService.resolveTicket(id, request.getInterventionReport());
            return ResponseEntity.ok(mapToResponse(ticket));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Close a ticket (CU-09: Résolu → Fermé)
     */
    @PutMapping("/{id}/close")
    public ResponseEntity<TicketResponse> closeTicket(@PathVariable Long id) {
        try {
            var ticket = ticketService.closeTicket(id);
            return ResponseEntity.ok(mapToResponse(ticket));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Reopen a closed ticket (CU-09: Alternative - Réouverture)
     */
    @PutMapping("/{id}/reopen")
    public ResponseEntity<TicketResponse> reopenTicket(@PathVariable Long id) {
        try {
            var ticket = ticketService.reopenTicket(id);
            return ResponseEntity.ok(mapToResponse(ticket));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Transfer ticket to another technician (CU-09: Alternative - Transfert)
     */
    @PutMapping("/{id}/transfer")
    public ResponseEntity<TicketResponse> transferTicket(
            @PathVariable Long id,
            @RequestBody TransferTicketRequest request) {
        try {
            var ticket = ticketService.transferTicket(id, request.getNewTechnicianId());
            return ResponseEntity.ok(mapToResponse(ticket));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all tickets
     */
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }

    /**
     * Helper method to map Ticket entity to TicketResponse DTO
     */
    private TicketResponse mapToResponse(com.digitello.ticket_service.entity.Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .screenId(ticket.getScreenId())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .problemType(ticket.getProblemType())
                .assignedToTechnicianId(ticket.getAssignedToTechnicianId())
                .createdByUserId(ticket.getCreatedByUserId())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .startedAt(ticket.getStartedAt())
                .resolvedAt(ticket.getResolvedAt())
                .closedAt(ticket.getClosedAt())
                .interventionReport(ticket.getInterventionReport())
                .build();
    }
}
