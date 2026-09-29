package com.roomly.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportsSummaryDto {
    private DashboardStatsDto stats;
    private List<RevenuePointDto> revenueData;
    private List<OccupancyPointDto> occupancyData;
    private List<BookingSourceDto> bookingSources;
}
