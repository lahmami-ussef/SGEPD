package com.digitello.ticket_service.dto;

import com.digitello.ticket_service.entity.TicketPriority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequest {
    private Long screenId;
    private String problemType;
    private String description;
    private TicketPriority priority;
    private Long createdByUserId;
}
