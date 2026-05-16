package com.utfpr.casacerta_api.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsortiumRequestDTO {

    @NotNull
    @Positive
    private Integer termMonths;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal annualAdminFee;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal reserveFund;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal bidPercentage;
}