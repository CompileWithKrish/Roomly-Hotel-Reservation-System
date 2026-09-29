package com.roomly.dto.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationSummaryDto {
    private String location;
    private long roomCount;
    private BigDecimal minPrice;
}
