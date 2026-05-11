package com.digitello.ticket_service.repository;

import com.digitello.ticket_service.entity.Ticket;
import com.digitello.ticket_service.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    List<Ticket> findByScreenId(Long screenId);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByAssignedToTechnicianId(Long technicianId);

    List<Ticket> findByStatusAndAssignedToTechnicianId(TicketStatus status, Long technicianId);

    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    @Query("SELECT t FROM Ticket t WHERE t.status = :status AND t.assignedToTechnicianId IS NULL ORDER BY t.createdAt ASC")
    List<Ticket> findUnassignedTicketsByStatus(@Param("status") TicketStatus status);

    @Query("SELECT t FROM Ticket t WHERE t.screenId = :screenId AND t.status = :status")
    List<Ticket> findByScreenIdAndStatus(@Param("screenId") Long screenId, @Param("status") TicketStatus status);

    List<Ticket> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}
