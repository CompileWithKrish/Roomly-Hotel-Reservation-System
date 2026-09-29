package com.roomly.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private double occupancyRate;
    @Builder.Default
    private double occupancyDelta = 4.2;
    private BigDecimal totalRevenue;
    @Builder.Default
    private double revenueDelta = 12.8;
    private int todayCheckIns;
    private int todayCheckOuts;
    private int activeGuests;
    private int availableRooms;
    private int totalRooms;
}
