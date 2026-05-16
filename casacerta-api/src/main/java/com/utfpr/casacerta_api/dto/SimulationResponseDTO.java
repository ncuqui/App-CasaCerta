package com.utfpr.casacerta_api.dto;

import com.utfpr.casacerta_api.enums.AmortizationType;
import com.utfpr.casacerta_api.enums.RecommendationType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationResponseDTO {

    private Long id;
    private BigDecimal propertyValue;
    private BigDecimal downPayment;
    private RecommendationType recommendation;
    private LocalDateTime createdAt;

    private FinancingResultDTO financing;
    private ConsortiumResultDTO consortium;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FinancingResultDTO {
        private Integer termMonths;
        private BigDecimal annualInterestRate;
        private AmortizationType amortizationType;
        private BigDecimal installmentValue;
        private BigDecimal totalCost;
        private BigDecimal totalInterest;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConsortiumResultDTO {
        private Integer termMonths;
        private BigDecimal annualAdminFee;
        private BigDecimal reserveFund;
        private BigDecimal bidPercentage;
        private BigDecimal monthlyContribution;
        private BigDecimal totalCost;
        private BigDecimal totalAdminFee;
    }
}