package com.digitello.dashboard_service.controller;

import com.digitello.dashboard_service.dto.DashboardStatsResponse;
import com.digitello.dashboard_service.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardStatsResponse> getStats(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(authHeader));
    }
}
