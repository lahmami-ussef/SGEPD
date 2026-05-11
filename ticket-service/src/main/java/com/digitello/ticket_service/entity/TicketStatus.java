package com.digitello.ticket_service.entity;

public enum TicketStatus {
    OUVERT,      // Open - newly created
    EN_COURS,    // In progress - technician is working
    RESOLU,      // Resolved - issue is fixed
    FERME        // Closed - archived
}
