package com.digitello.ticket_service.controller;

import com.digitello.ticket_service.dto.CreateTicketRequest;
import com.digitello.ticket_service.dto.AssignTicketRequest;
import com.digitello.ticket_service.dto.ResolveTicketRequest;
import com.digitello.ticket_service.entity.Ticket;
import com.digitello.ticket_service.entity.TicketPriority;
import com.digitello.ticket_service.entity.TicketStatus;
import com.digitello.ticket_service.service.TicketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TicketService ticketService;

    @Autowired
    private ObjectMapper objectMapper;

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
    public void testCreateTicket() throws Exception {
        CreateTicketRequest request = CreateTicketRequest.builder()
                .screenId(10L)
                .problemType("panne matérielle")
                .description("L'écran ne s'allume pas")
                .priority(TicketPriority.HAUTE)
                .createdByUserId(1L)
                .build();

        when(ticketService.createTicket(
                anyLong(), anyString(), anyString(), any(), anyLong()
        )).thenReturn(testTicket);

        mockMvc.perform(post("/api/tickets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.ticketNumber").value("TICK-20260508-001"))
                .andExpect(jsonPath("$.status").value("OUVERT"));
    }

    @Test
    public void testGetTicketById() throws Exception {
        when(ticketService.getTicketById(1L)).thenReturn(Optional.of(testTicket));

        mockMvc.perform(get("/api/tickets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.ticketNumber").value("TICK-20260508-001"));
    }

    @Test
    public void testGetTicketByIdNotFound() throws Exception {
        when(ticketService.getTicketById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/tickets/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testGetTicketByNumber() throws Exception {
        when(ticketService.getTicketByNumber("TICK-20260508-001")).thenReturn(Optional.of(testTicket));

        mockMvc.perform(get("/api/tickets/number/TICK-20260508-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketNumber").value("TICK-20260508-001"));
    }

    @Test
    public void testGetTicketsByScreen() throws Exception {
        when(ticketService.getTicketsByScreen(10L)).thenReturn(List.of(testTicket));

        mockMvc.perform(get("/api/tickets/screen/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].screenId").value(10L));
    }

    @Test
    public void testGetTicketsByStatus() throws Exception {
        when(ticketService.getTicketsByStatus(TicketStatus.OUVERT)).thenReturn(List.of(testTicket));

        mockMvc.perform(get("/api/tickets/status/OUVERT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("OUVERT"));
    }

    @Test
    public void testGetTicketsByTechnician() throws Exception {
        testTicket.setAssignedToTechnicianId(5L);
        when(ticketService.getTicketsByTechnician(5L)).thenReturn(List.of(testTicket));

        mockMvc.perform(get("/api/tickets/technician/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].assignedToTechnicianId").value(5L));
    }

    @Test
    public void testAssignTicket() throws Exception {
        testTicket.setAssignedToTechnicianId(5L);
        AssignTicketRequest request = AssignTicketRequest.builder().technicianId(5L).build();

        when(ticketService.assignTicketToTechnician(1L, 5L)).thenReturn(testTicket);

        mockMvc.perform(post("/api/tickets/1/assign")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedToTechnicianId").value(5L));
    }

    @Test
    public void testStartTicket() throws Exception {
        testTicket.setStatus(TicketStatus.EN_COURS);
        testTicket.setStartedAt(LocalDateTime.now());

        when(ticketService.startTicket(1L)).thenReturn(testTicket);

        mockMvc.perform(put("/api/tickets/1/start"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EN_COURS"));
    }

    @Test
    public void testResolveTicket() throws Exception {
        testTicket.setStatus(TicketStatus.RESOLU);
        testTicket.setResolvedAt(LocalDateTime.now());
        testTicket.setInterventionReport("Écran remplacé");

        ResolveTicketRequest request = ResolveTicketRequest.builder()
                .interventionReport("Écran remplacé")
                .build();

        when(ticketService.resolveTicket(1L, "Écran remplacé")).thenReturn(testTicket);

        mockMvc.perform(put("/api/tickets/1/resolve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLU"));
    }

    @Test
    public void testCloseTicket() throws Exception {
        testTicket.setStatus(TicketStatus.FERME);
        testTicket.setClosedAt(LocalDateTime.now());

        when(ticketService.closeTicket(1L)).thenReturn(testTicket);

        mockMvc.perform(put("/api/tickets/1/close"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FERME"));
    }

    @Test
    public void testGetAllTickets() throws Exception {
        when(ticketService.getAllTickets()).thenReturn(List.of(testTicket));

        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));
    }
}
