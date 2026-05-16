package com.utfpr.casacerta_api.service;

import com.utfpr.casacerta_api.dto.ConsortiumRequestDTO;
import com.utfpr.casacerta_api.entity.ConsortiumSimulation;
import com.utfpr.casacerta_api.entity.Simulation;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class ConsortiumService {

    /**
     * Calculates the consortium simulation and returns a populated entity.
     *
     * Monthly contribution breakdown:
     *   - Base share:       propertyValue / termMonths
     *   - Admin fee share:  propertyValue * (annualAdminFee / 100) / 12
     *   - Reserve fund:     propertyValue * (reserveFund / 100) / 12
     *
     * Total cost = (monthlyContribution * termMonths) + bidAmount
     * Bid amount = propertyValue * (bidPercentage / 100)
     */
    public ConsortiumSimulation calculate(Simulation simulation, ConsortiumRequestDTO dto) {
        BigDecimal propertyValue = simulation.getPropertyValue();

        BigDecimal baseShare = propertyValue
                .divide(BigDecimal.valueOf(dto.getTermMonths()), 10, RoundingMode.HALF_UP);

        BigDecimal monthlyAdminFee = propertyValue
                .multiply(dto.getAnnualAdminFee().divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP))
                .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);

        BigDecimal monthlyReserveFund = propertyValue
                .multiply(dto.getReserveFund().divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP))
                .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);

        BigDecimal monthlyContribution = baseShare
                .add(monthlyAdminFee)
                .add(monthlyReserveFund)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalAdminFee = monthlyAdminFee
                .multiply(BigDecimal.valueOf(dto.getTermMonths()))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal bidAmount = propertyValue
                .multiply(dto.getBidPercentage().divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalCost = monthlyContribution
                .multiply(BigDecimal.valueOf(dto.getTermMonths()))
                .add(bidAmount)
                .setScale(2, RoundingMode.HALF_UP);

        return ConsortiumSimulation.builder()
                .simulation(simulation)
                .termMonths(dto.getTermMonths())
                .annualAdminFee(dto.getAnnualAdminFee())
                .reserveFund(dto.getReserveFund())
                .bidPercentage(dto.getBidPercentage())
                .monthlyContribution(monthlyContribution)
                .totalCost(totalCost)
                .totalAdminFee(totalAdminFee)
                .build();
    }
}