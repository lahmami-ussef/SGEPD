package com.digitello.ticket_service.service;

import com.digitello.ticket_service.entity.Ticket;
import com.digitello.ticket_service.entity.TicketPriority;
import com.digitello.ticket_service.entity.TicketStatus;
import com.digitello.ticket_service.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    /**
     * Create a new intervention ticket
     */
    @Transactional
    public Ticket createTicket(Long screenId, String problemType, String description,
                               TicketPriority priority, Long createdByUserId) {
        
        // Generate unique ticket number: TICK-YYYYMMDD-XXX
        String ticketNumber = generateTicketNumber();
        
        Ticket ticket = Ticket.builder()
                .ticketNumber(ticketNumber)
                .screenId(screenId)
                .problemType(problemType)
                .description(description)
                .priority(priority)
                .status(TicketStatus.OUVERT)
                .createdByUserId(createdByUserId)
                .build();
        
        return ticketRepository.save(ticket);
    }

    /**
     * Get ticket by ID
     */
    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    /**
     * Get ticket by ticket number
     */
    public Optional<Ticket> getTicketByNumber(String ticketNumber) {
        return ticketRepository.findByTicketNumber(ticketNumber);
    }

    /**
     * Get all tickets for a screen
     */
    public List<Ticket> getTicketsByScreen(Long screenId) {
        return ticketRepository.findByScreenId(screenId);
    }

    /**
     * Get all open tickets for a screen
     */
    public List<Ticket> getOpenTicketsByScreen(Long screenId) {
        return ticketRepository.findByScreenIdAndStatus(screenId, TicketStatus.OUVERT);
    }

    /**
     * Get all tickets by status
     */
    public List<Ticket> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    /**
     * Get tickets assigned to a technician
     */
    public List<Ticket> getTicketsByTechnician(Long technicianId) {
        return ticketRepository.findByAssignedToTechnicianId(technicianId);
    }

    /**
     * Get active tickets assigned to a technician
     */
    public List<Ticket> getActiveTicketsByTechnician(Long technicianId) {
        return ticketRepository.findByStatusAndAssignedToTechnicianId(TicketStatus.EN_COURS, technicianId);
    }

    /**
     * Get unassigned open tickets
     */
    public List<Ticket> getUnassignedOpenTickets() {
        return ticketRepository.findUnassignedTicketsByStatus(TicketStatus.OUVERT);
    }

    /**
     * Assign ticket to a technician
     */
    @Transactional
    public Ticket assignTicketToTechnician(Long ticketId, Long technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
        
        if (!ticket.getStatus().equals(TicketStatus.OUVERT)) {
            throw new RuntimeException("Only open tickets can be assigned");
        }
        
        ticket.setAssignedToTechnicianId(technicianId);
        return ticketRepository.save(ticket);
    }

    /**
     * Start working on a ticket (change status from OUVERT to EN_COURS)
     */
    @Transactional
    public Ticket startTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
        
        if (!ticket.getStatus().equals(TicketStatus.OUVERT)) {
            throw new RuntimeException("Only open tickets can be started");
        }
        
        ticket.setStatus(TicketStatus.EN_COURS);
        ticket.setStartedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    /**
     * Mark ticket as resolved with intervention report
     */
    @Transactional
    public Ticket resolveTicket(Long ticketId, String interventionReport) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
        
        if (!ticket.getStatus().equals(TicketStatus.EN_COURS)) {
            throw new RuntimeException("Only tickets in progress can be resolved");
        }
        
        ticket.setStatus(TicketStatus.RESOLU);
        ticket.setResolvedAt(LocalDateTime.now());
        ticket.setInterventionReport(interventionReport);
        return ticketRepository.save(ticket);
    }

    /**
     * Close a resolved ticket
     */
    @Transactional
    public Ticket closeTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
        
        if (!ticket.getStatus().equals(TicketStatus.RESOLU)) {
            throw new RuntimeException("Only resolved tickets can be closed");
        }
        
        ticket.setStatus(TicketStatus.FERME);
        ticket.setClosedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    /**
     * Reopen a closed ticket
     */
    @Transactional
    public Ticket reopenTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
        
        if (!ticket.getStatus().equals(TicketStatus.FERME)) {
            throw new RuntimeException("Only closed tickets can be reopened");
        }
        
        ticket.setStatus(TicketStatus.OUVERT);
        return ticketRepository.save(ticket);
    }

    /**
     * Transfer ticket to another technician
     */
    @Transactional
    public Ticket transferTicket(Long ticketId, Long newTechnicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
        
        if (!ticket.getStatus().equals(TicketStatus.EN_COURS)) {
            throw new RuntimeException("Only tickets in progress can be transferred");
        }
        
        ticket.setAssignedToTechnicianId(newTechnicianId);
        return ticketRepository.save(ticket);
    }

    /**
     * Get all tickets
     */
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    /**
     * Generate unique ticket number: TICK-YYYYMMDD-XXX
     */
    private String generateTicketNumber() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String dateStr = LocalDateTime.now().format(formatter);
        
        // Count tickets created today
        List<Ticket> todayTickets = ticketRepository.findByCreatedAtBetween(
                LocalDateTime.now().withHour(0).withMinute(0).withSecond(0),
                LocalDateTime.now().withHour(23).withMinute(59).withSecond(59)
        );
        
        int nextNumber = todayTickets.size() + 1;
        return String.format("TICK-%s-%03d", dateStr, nextNumber);
    }
}
