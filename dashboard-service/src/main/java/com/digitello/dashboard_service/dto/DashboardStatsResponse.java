package com.digitello.dashboard_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private List<KpiData> kpis;
    private List<ActivityBar> activity;
    private List<ScreenStatusPct> screenStatuses;
    private List<RecentTicketDto> recentTickets;
    private List<TopClientDto> topClients;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KpiData {
        private String label;
        private String value;
        private String change;
        private String trend; // "up" or "down"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityBar {
        private String day;
        private int height;
        private boolean weekend;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ScreenStatusPct {
        private String label;
        private int count;
        private int pct;
        private String color;
        private String badgeBg;
        private String badgeText;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentTicketDto {
        private String id;
        private String desc;
        private String client;
        private String status;
        private String bg;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopClientDto {
        private String name;
        private int screens;
        private String status;
        private String bg;
        private String color;
    }
}
