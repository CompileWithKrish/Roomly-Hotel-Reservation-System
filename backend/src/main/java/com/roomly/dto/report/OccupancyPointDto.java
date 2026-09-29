package com.roomly.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyPointDto {
    private String roomType;
    private int occupied;
    private int available;
    private double rate;
}
