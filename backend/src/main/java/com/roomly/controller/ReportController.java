package com.roomly.controller;

import com.roomly.dto.report.*;
import com.roomly.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Analytics", description = "Hotel performance KPIs, ADR yield, revenue and occupancy metrics")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get high-level dashboard operations and financial metrics")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get monthly financial yield and revenue timeline")
    public ResponseEntity<List<RevenuePointDto>> getRevenueReport() {
        return ResponseEntity.ok(reportService.getRevenueData());
    }

    @GetMapping("/occupancy")
    @Operation(summary = "Get occupancy breakdown across suite categories")
    public ResponseEntity<List<OccupancyPointDto>> getOccupancyReport() {
        return ResponseEntity.ok(reportService.getOccupancyData());
    }

    @GetMapping("/sources")
    @Operation(summary = "Get distribution of reservation booking sources")
    public ResponseEntity<List<BookingSourceDto>> getBookingSources() {
        return ResponseEntity.ok(reportService.getBookingSources());
    }

    @GetMapping("/summary")
    @Operation(summary = "Get comprehensive aggregate reports payload")
    public ResponseEntity<ReportsSummaryDto> getReportsSummary() {
        return ResponseEntity.ok(reportService.getReportsSummary());
    }
}
