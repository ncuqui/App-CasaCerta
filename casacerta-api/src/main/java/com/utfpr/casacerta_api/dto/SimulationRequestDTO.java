package com.utfpr.casacerta_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationRequestDTO {

    @NotNull
    private Long userId;

    @NotNull
    @Positive
    private BigDecimal propertyValue;

    @NotNull
    @PositiveOrZero
    private BigDecimal downPayment;

    @Valid
    private FinancingRequestDTO financing;

    @Valid
    private ConsortiumRequestDTO consortium;
}