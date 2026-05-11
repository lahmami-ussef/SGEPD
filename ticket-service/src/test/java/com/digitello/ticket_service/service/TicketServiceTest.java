package com.digitello.ticket_service.service;

import com.digitello.ticket_service.entity.Ticket;
import com.digitello.ticket_service.entity.TicketPriority;
import com.digitello.ticket_service.entity.TicketStatus;
import com.digitello.ticket_service.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private TicketService ticketService;

    private Ticket testTicket;

    @BeforeEach
    public void setUp() {
        testTicket = Ticket.builder()
                .id(1L)
                .ticketNumber("TICK-20260508-001")
                .screenId(10L)
                .problemType("panne matérielle")
                .description("L'écran ne s'allume pas")
                .priority(TicketPriority.HAUTE)
                .status(TicketStatus.OUVERT)
                .createdByUserId(1L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    public void testCreateTicket() {
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);
        when(ticketRepository.findByCreatedAtBetween(any(), any())).thenReturn(List.of());

        Ticket created = ticketService.createTicket(
                10L, "panne matérielle", "L'écran ne s'allume pas",
                TicketPriority.HAUTE, 1L
        );

        assertNotNull(created);
        assertEquals(10L, created.getScreenId());
        assertEquals(TicketStatus.OUVERT, created.getStatus());
        assertTrue(created.getTicketNumber().startsWith("TICK-"));
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    public void testGetTicketById() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));

        Optional<Ticket> found = ticketService.getTicketById(1L);

        assertTrue(found.isPresent());
        assertEquals(1L, found.get().getId());
        assertEquals("TICK-20260508-001", found.get().getTicketNumber());
    }

    @Test
    public void testGetTicketByNumber() {
        when(ticketRepository.findByTicketNumber("TICK-20260508-001")).thenReturn(Optional.of(testTicket));

        Optional<Ticket> found = ticketService.getTicketByNumber("TICK-20260508-001");

        assertTrue(found.isPresent());
        assertEquals("TICK-20260508-001", found.get().getTicketNumber());
    }

    @Test
    public void testGetTicketsByScreen() {
        List<Ticket> tickets = List.of(testTicket);
        when(ticketRepository.findByScreenId(10L)).thenReturn(tickets);

        List<Ticket> found = ticketService.getTicketsByScreen(10L);

        assertEquals(1, found.size());
        assertEquals(10L, found.get(0).getScreenId());
    }

    @Test
    public void testGetOpenTicketsByScreen() {
        List<Ticket> tickets = List.of(testTicket);
        when(ticketRepository.findByScreenIdAndStatus(10L, TicketStatus.OUVERT)).thenReturn(tickets);

        List<Ticket> found = ticketService.getOpenTicketsByScreen(10L);

        assertEquals(1, found.size());
        assertEquals(TicketStatus.OUVERT, found.get(0).getStatus());
    }

    @Test
    public void testAssignTicketToTechnician() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);

        Ticket assigned = ticketService.assignTicketToTechnician(1L, 5L);

        assertNotNull(assigned);
        assertEquals(5L, assigned.getAssignedToTechnicianId());
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    public void testAssignTicketToTechnicianFailsIfNotOpen() {
        Ticket closedTicket = Ticket.builder()
                .id(1L)
                .status(TicketStatus.FERME)
                .build();
        
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(closedTicket));

        assertThrows(RuntimeException.class, () -> 
            ticketService.assignTicketToTechnician(1L, 5L)
        );
    }

    @Test
    public void testStartTicket() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));
        testTicket.setStatus(TicketStatus.EN_COURS);
        testTicket.setStartedAt(LocalDateTime.now());
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);

        Ticket started = ticketService.startTicket(1L);

        assertNotNull(started);
        assertEquals(TicketStatus.EN_COURS, started.getStatus());
        assertNotNull(started.getStartedAt());
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    public void testResolveTicket() {
        testTicket.setStatus(TicketStatus.EN_COURS);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));
        testTicket.setStatus(TicketStatus.RESOLU);
        testTicket.setResolvedAt(LocalDateTime.now());
        testTicket.setInterventionReport("Écran remplacé");
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);

        Ticket resolved = ticketService.resolveTicket(1L, "Écran remplacé");

        assertNotNull(resolved);
        assertEquals(TicketStatus.RESOLU, resolved.getStatus());
        assertEquals("Écran remplacé", resolved.getInterventionReport());
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    public void testCloseTicket() {
        testTicket.setStatus(TicketStatus.RESOLU);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));
        testTicket.setStatus(TicketStatus.FERME);
        testTicket.setClosedAt(LocalDateTime.now());
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);

        Ticket closed = ticketService.closeTicket(1L);

        assertNotNull(closed);
        assertEquals(TicketStatus.FERME, closed.getStatus());
        assertNotNull(closed.getClosedAt());
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    public void testReopenTicket() {
        testTicket.setStatus(TicketStatus.FERME);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));
        testTicket.setStatus(TicketStatus.OUVERT);
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);

        Ticket reopened = ticketService.reopenTicket(1L);

        assertNotNull(reopened);
        assertEquals(TicketStatus.OUVERT, reopened.getStatus());
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    public void testTransferTicket() {
        testTicket.setStatus(TicketStatus.EN_COURS);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));
        testTicket.setAssignedToTechnicianId(7L);
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);

        Ticket transferred = ticketService.transferTicket(1L, 7L);

        assertNotNull(transferred);
        assertEquals(7L, transferred.getAssignedToTechnicianId());
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    public void testGetAllTickets() {
        List<Ticket> tickets = List.of(testTicket);
        when(ticketRepository.findAll()).thenReturn(tickets);

        List<Ticket> found = ticketService.getAllTickets();

        assertEquals(1, found.size());
        verify(ticketRepository, times(1)).findAll();
    }
}
