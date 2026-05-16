package com.utfpr.casacerta_api.entity;

import com.utfpr.casacerta_api.enums.AmortizationType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "financing_simulations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancingSimulation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "simulation_id", nullable = false)
    private Simulation simulation;

    @Column(name = "term_months", nullable = false)
    private Integer termMonths;

    @Column(name = "annual_interest_rate", nullable = false, precision = 8, scale = 4)
    private BigDecimal annualInterestRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "amortization_type", nullable = false)
    private AmortizationType amortizationType;

    // Calculated results
    // PRICE: fixed installment | SAC: first (highest) installment
    @Column(name = "installment_value", precision = 15, scale = 2)
    private BigDecimal installmentValue;

    @Column(name = "total_cost", precision = 15, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "total_interest", precision = 15, scale = 2)
    private BigDecimal totalInterest;
}