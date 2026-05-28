package com.digitello.assignment_service.repository;

import com.digitello.assignment_service.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByScreenId(Long screenId);
    List<Assignment> findByClientId(Long clientId);
    List<Assignment> findByStatus(Assignment.Status status);
    boolean existsByClientId(Long clientId);

    @Query("SELECT a FROM Assignment a WHERE a.screenId = :screenId " +
           "AND a.status = 'ACTIF' " +
           "AND ((a.startDate <= :endDate AND a.endDate >= :startDate))")
    List<Assignment> findConflicts(@Param("screenId") Long screenId,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Assignment a WHERE a.endDate BETWEEN :today AND :limitDate AND a.status = 'ACTIF'")
    List<Assignment> findExpiringBetween(@Param("today") LocalDate today,
                                          @Param("limitDate") LocalDate limitDate);
}