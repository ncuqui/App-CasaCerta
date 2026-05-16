package com.utfpr.casacerta_api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "consortium_simulations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsortiumSimulation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "simulation_id", nullable = false)
    private Simulation simulation;

    @Column(name = "term_months", nullable = false)
    private Integer termMonths;

    @Column(name = "annual_admin_fee", nullable = false, precision = 8, scale = 4)
    private BigDecimal annualAdminFee;

    @Column(name = "reserve_fund", precision = 8, scale = 4)
    private BigDecimal reserveFund;

    @Column(name = "bid_percentage", precision = 8, scale = 4)
    private BigDecimal bidPercentage;

    // Calculated results
    @Column(name = "monthly_contribution", precision = 15, scale = 2)
    private BigDecimal monthlyContribution;

    @Column(name = "total_cost", precision = 15, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "total_admin_fee", precision = 15, scale = 2)
    private BigDecimal totalAdminFee;
}