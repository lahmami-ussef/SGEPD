package com.digitello.dashboard_service.service;

import com.digitello.dashboard_service.dto.DashboardStatsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final RestTemplate restTemplate;

    @Value("${services.screen-url:http://localhost:8082}")
    private String screenServiceUrl;

    @Value("${services.ticket-url:http://localhost:8083}")
    private String ticketServiceUrl;

    @Value("${services.client-url:http://localhost:8083}")
    private String clientServiceUrl;

    @Value("${services.assignment-url:http://localhost:8084}")
    private String assignmentServiceUrl;

    public DashboardStatsResponse getDashboardStats(String authHeader) {
        log.info("Fetching consolidated dashboard stats...");

        // Http headers to propagate JWT token
        HttpHeaders headers = new HttpHeaders();
        if (authHeader != null && !authHeader.isEmpty()) {
            headers.set("Authorization", authHeader);
        }
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Retrieve screens
        List<Map<String, Object>> screens = new ArrayList<>();
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    screenServiceUrl + "/api/screens",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            if (response.getBody() != null) {
                screens = response.getBody();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch screens from Screen Service: {}. Using mock fallbacks if needed.", e.getMessage());
        }

        // Retrieve tickets
        List<Map<String, Object>> tickets = new ArrayList<>();
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    ticketServiceUrl + "/api/tickets",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            if (response.getBody() != null) {
                tickets = response.getBody();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch tickets from Ticket Service: {}. Using mock fallbacks if needed.", e.getMessage());
        }

        // Retrieve clients
        List<Map<String, Object>> clients = new ArrayList<>();
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    clientServiceUrl + "/api/clients",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            if (response.getBody() != null) {
                clients = response.getBody();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch clients from Client Service: {}. Using mock fallbacks if needed.", e.getMessage());
        }

        // Retrieve assignments (to count screen/client mappings)
        List<Map<String, Object>> assignments = new ArrayList<>();
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    assignmentServiceUrl + "/api/assignments",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            if (response.getBody() != null) {
                assignments = response.getBody();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch assignments from Assignment Service: {}. Using mock fallbacks if needed.", e.getMessage());
        }

        return aggregateData(screens, tickets, clients, assignments);
    }

    private Long parseLongSafely(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            String str = String.valueOf(value);
            if (str.contains(".")) {
                return (long) Double.parseDouble(str);
            }
            return Long.parseLong(str);
        } catch (Exception e) {
            return null;
        }
    }

    private int getDayOfWeekFromCreatedAt(Object createdAtObj) {
        if (createdAtObj == null) {
            return -1;
        }
        try {
            if (createdAtObj instanceof String) {
                String str = (String) createdAtObj;
                java.time.LocalDateTime ldt;
                if (str.contains("T")) {
                    try {
                        ldt = java.time.LocalDateTime.parse(str);
                    } catch (Exception ex) {
                        ldt = java.time.ZonedDateTime.parse(str).toLocalDateTime();
                    }
                } else {
                    ldt = java.time.LocalDateTime.parse(str, java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                }
                return ldt.getDayOfWeek().getValue(); // 1 = Monday, 7 = Sunday
            } else if (createdAtObj instanceof List) {
                List<?> list = (List<?>) createdAtObj;
                if (list.size() >= 3) {
                    int year = ((Number) list.get(0)).intValue();
                    int month = ((Number) list.get(1)).intValue();
                    int day = ((Number) list.get(2)).intValue();
                    return java.time.LocalDate.of(year, month, day).getDayOfWeek().getValue();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse createdAt date: {}", createdAtObj, e);
        }
        return -1;
    }

    private DashboardStatsResponse aggregateData(
            List<Map<String, Object>> screens,
            List<Map<String, Object>> tickets,
            List<Map<String, Object>> clients,
            List<Map<String, Object>> assignments) {

        // 1. Screens metrics & status
        int totalScreens = screens.size();
        int activeCount = 0;
        int maintenanceCount = 0;
        int brokenCount = 0;

        for (Map<String, Object> s : screens) {
            String status = String.valueOf(s.get("status"));
            if ("ACTIF".equalsIgnoreCase(status)) {
                activeCount++;
            } else if ("EN_MAINTENANCE".equalsIgnoreCase(status)) {
                maintenanceCount++;
            } else if ("EN_PANNE".equalsIgnoreCase(status)) {
                brokenCount++;
            }
        }

        double availabilityRate = (totalScreens > 0) ? ((double) activeCount * 100.0 / totalScreens) : 0.0;
        String formattedAvailability = String.format(Locale.US, "%.1f%%", availabilityRate);

        // 2. Tickets metrics
        long openTicketsCount = tickets.stream()
                .filter(t -> {
                    String status = String.valueOf(t.get("status"));
                    return "OUVERT".equalsIgnoreCase(status) || "EN_COURS".equalsIgnoreCase(status);
                })
                .count();

        // 3. Clients metrics
        int activeClientsCount = clients.size();

        // Build KPIs list with actual dynamic descriptions instead of hardcoded mock trends
        List<DashboardStatsResponse.KpiData> kpis = Arrays.asList(
                DashboardStatsResponse.KpiData.builder()
                        .label("Écrans actifs")
                        .value(String.valueOf(activeCount))
                        .change(totalScreens + " écrans au total")
                        .trend(activeCount > 0 ? "up" : "down")
                        .build(),
                DashboardStatsResponse.KpiData.builder()
                        .label("Tickets ouverts")
                        .value(String.valueOf(openTicketsCount))
                        .change(openTicketsCount + " non résolus")
                        .trend(openTicketsCount > 0 ? "down" : "up")
                        .build(),
                DashboardStatsResponse.KpiData.builder()
                        .label("Clients actifs")
                        .value(String.valueOf(activeClientsCount))
                        .change(activeClientsCount + " au total")
                        .trend(activeClientsCount > 0 ? "up" : "down")
                        .build(),
                DashboardStatsResponse.KpiData.builder()
                        .label("Taux de dispo.")
                        .value(formattedAvailability)
                        .change("Basé sur les statuts réels")
                        .trend(availabilityRate >= 95.0 ? "up" : "down")
                        .build()
        );

        // 4. Activity chart (based on real tickets created per day of the week)
        int[] dailyCounts = new int[8]; // index 1 to 7 for Monday to Sunday
        for (Map<String, Object> t : tickets) {
            Object createdAtObj = t.get("createdAt");
            int dayOfWeek = getDayOfWeekFromCreatedAt(createdAtObj);
            if (dayOfWeek >= 1 && dayOfWeek <= 7) {
                dailyCounts[dayOfWeek]++;
            }
        }

        int maxDailyCount = Arrays.stream(dailyCounts).max().orElse(0);

        List<DashboardStatsResponse.ActivityBar> activity = Arrays.asList(
                new DashboardStatsResponse.ActivityBar("L", maxDailyCount > 0 ? (dailyCounts[1] * 100 / maxDailyCount) : 0, false),
                new DashboardStatsResponse.ActivityBar("M", maxDailyCount > 0 ? (dailyCounts[2] * 100 / maxDailyCount) : 0, false),
                new DashboardStatsResponse.ActivityBar("M", maxDailyCount > 0 ? (dailyCounts[3] * 100 / maxDailyCount) : 0, false),
                new DashboardStatsResponse.ActivityBar("J", maxDailyCount > 0 ? (dailyCounts[4] * 100 / maxDailyCount) : 0, false),
                new DashboardStatsResponse.ActivityBar("V", maxDailyCount > 0 ? (dailyCounts[5] * 100 / maxDailyCount) : 0, false),
                new DashboardStatsResponse.ActivityBar("S", maxDailyCount > 0 ? (dailyCounts[6] * 100 / maxDailyCount) : 0, true),
                new DashboardStatsResponse.ActivityBar("D", maxDailyCount > 0 ? (dailyCounts[7] * 100 / maxDailyCount) : 0, true)
        );

        // 5. Screen status list percentages
        int actPct = 0;
        int maintPct = 0;
        int brokenPct = 0;
        if (totalScreens > 0) {
            actPct = (int) Math.round((double) activeCount * 100.0 / totalScreens);
            maintPct = (int) Math.round((double) maintenanceCount * 100.0 / totalScreens);
            brokenPct = 100 - actPct - maintPct;
        }

        List<DashboardStatsResponse.ScreenStatusPct> screenStatuses = Arrays.asList(
                DashboardStatsResponse.ScreenStatusPct.builder()
                        .label("En ligne")
                        .count(activeCount)
                        .pct(actPct)
                        .color("#1D9E75")
                        .badgeBg("#E1F5EE")
                        .badgeText("#0F6E56")
                        .build(),
                DashboardStatsResponse.ScreenStatusPct.builder()
                        .label("En attente")
                        .count(maintenanceCount)
                        .pct(maintPct)
                        .color("#BA7517")
                        .badgeBg("#FAEEDA")
                        .badgeText("#854F0B")
                        .build(),
                DashboardStatsResponse.ScreenStatusPct.builder()
                        .label("Hors ligne")
                        .count(brokenCount)
                        .pct(brokenPct)
                        .color("#E24B4A")
                        .badgeBg("#FCEBEB")
                        .badgeText("#A32D2D")
                        .build()
        );

        // 6. Recent tickets (map real ones, NO mock fallbacks)
        List<DashboardStatsResponse.RecentTicketDto> recentTickets = new ArrayList<>();
        if (!tickets.isEmpty()) {
            List<Map<String, Object>> sortedTickets = tickets.stream()
                    .sorted((t1, t2) -> {
                        Long id1 = parseLongSafely(t1.get("id"));
                        Long id2 = parseLongSafely(t2.get("id"));
                        if (id1 == null && id2 == null) return 0;
                        if (id1 == null) return 1;
                        if (id2 == null) return -1;
                        return id2.compareTo(id1);
                    })
                    .limit(5)
                    .collect(Collectors.toList());

            for (Map<String, Object> t : sortedTickets) {
                Long rawId = parseLongSafely(t.get("id"));
                String idStr = "#TK-" + String.format("%03d", rawId != null ? rawId : 0L);
                String desc = String.valueOf(t.get("description"));
                String status = String.valueOf(t.get("status"));
                String priority = String.valueOf(t.get("priority"));

                // Map client name from assignments if possible
                String clientName = "Client Inconnu";
                Long screenId = parseLongSafely(t.get("screenId"));

                if (screenId != null) {
                    final Long scrId = screenId;
                    Optional<Map<String, Object>> optAssign = assignments.stream()
                            .filter(a -> scrId.equals(parseLongSafely(a.get("screenId"))))
                            .findFirst();

                    if (optAssign.isPresent()) {
                        Long clientId = parseLongSafely(optAssign.get().get("clientId"));
                        if (clientId != null) {
                            clientName = clients.stream()
                                    .filter(c -> clientId.equals(parseLongSafely(c.get("id"))))
                                    .map(c -> String.valueOf(c.get("name")))
                                    .findFirst()
                                    .orElse("Client #" + clientId);
                        }
                    }
                }

                // Determine badge colors based on priority / status
                String badgeText = "Ouvert";
                String bg = "#FAEEDA"; // Orange soft
                String color = "#854F0B";

                if ("RESOLU".equalsIgnoreCase(status) || "FERME".equalsIgnoreCase(status)) {
                    badgeText = "Résolu";
                    bg = "#E1F5EE"; // Green soft
                    color = "#0F6E56";
                } else if ("URGENT".equalsIgnoreCase(priority)) {
                    badgeText = "Urgent";
                    bg = "#FCEBEB"; // Red soft
                    color = "#A32D2D";
                } else if ("EN_COURS".equalsIgnoreCase(status)) {
                    badgeText = "En cours";
                    bg = "#FAEEDA";
                    color = "#854F0B";
                }

                recentTickets.add(DashboardStatsResponse.RecentTicketDto.builder()
                        .id(idStr)
                        .desc(desc)
                        .client(clientName)
                        .status(badgeText)
                        .bg(bg)
                        .color(color)
                        .build());
            }
        }

        // 7. Top Clients list (NO mock fallbacks)
        List<DashboardStatsResponse.TopClientDto> topClients = new ArrayList<>();
        if (!clients.isEmpty() && !assignments.isEmpty()) {
            Map<Long, Integer> clientScreenCounts = new HashMap<>();
            for (Map<String, Object> a : assignments) {
                Long clientId = parseLongSafely(a.get("clientId"));
                if (clientId != null) {
                    clientScreenCounts.put(clientId, clientScreenCounts.getOrDefault(clientId, 0) + 1);
                }
            }

            List<Map.Entry<Long, Integer>> sortedClientCounts = clientScreenCounts.entrySet().stream()
                    .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                    .limit(5)
                    .collect(Collectors.toList());

            for (Map.Entry<Long, Integer> entry : sortedClientCounts) {
                Long clientId = entry.getKey();
                int scCount = entry.getValue();

                Map<String, Object> clientMap = clients.stream()
                        .filter(c -> clientId.equals(parseLongSafely(c.get("id"))))
                        .findFirst()
                        .orElse(null);

                if (clientMap != null) {
                    String name = String.valueOf(clientMap.get("name"));
                    String clientStatus = "Actif"; // default
                    String bg = "#E1F5EE";
                    String color = "#0F6E56";

                    topClients.add(DashboardStatsResponse.TopClientDto.builder()
                            .name(name)
                            .screens(scCount)
                            .status(clientStatus)
                            .bg(bg)
                            .color(color)
                            .build());
                }
            }
        }

        return DashboardStatsResponse.builder()
                .kpis(kpis)
                .activity(activity)
                .screenStatuses(screenStatuses)
                .recentTickets(recentTickets)
                .topClients(topClients)
                .build();
    }
}
