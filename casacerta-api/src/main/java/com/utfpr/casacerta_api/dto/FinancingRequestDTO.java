package com.utfpr.casacerta_api.dto;

import com.utfpr.casacerta_api.enums.AmortizationType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancingRequestDTO {

    @NotNull
    @Positive
    private Integer termMonths;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal annualInterestRate;

    @NotNull
    private AmortizationType amortizationType;
}