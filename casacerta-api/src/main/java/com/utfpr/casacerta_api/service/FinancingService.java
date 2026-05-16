package com.utfpr.casacerta_api.service;

import com.utfpr.casacerta_api.dto.FinancingRequestDTO;
import com.utfpr.casacerta_api.entity.FinancingSimulation;
import com.utfpr.casacerta_api.entity.Simulation;
import com.utfpr.casacerta_api.enums.AmortizationType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class FinancingService {

    /**
     * Calculates the financing simulation and returns a populated entity.
     * Financed amount = propertyValue - downPayment.
     */
    public FinancingSimulation calculate(Simulation simulation, FinancingRequestDTO dto) {
        BigDecimal financedAmount = simulation.getPropertyValue().subtract(simulation.getDownPayment());
        BigDecimal monthlyRate = toMonthlyRate(dto.getAnnualInterestRate());

        BigDecimal installmentValue;
        BigDecimal totalCost;

        if (dto.getAmortizationType() == AmortizationType.PRICE) {
            installmentValue = calculatePriceInstallment(financedAmount, monthlyRate, dto.getTermMonths());
            totalCost = installmentValue
                    .multiply(BigDecimal.valueOf(dto.getTermMonths()))
                    .add(simulation.getDownPayment())
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            // SAC: total cost = sum of all decreasing installments + down payment
            installmentValue = calculateSACFirstInstallment(financedAmount, monthlyRate, dto.getTermMonths());
            totalCost = calculateSACTotalCost(financedAmount, monthlyRate, dto.getTermMonths())
                    .add(simulation.getDownPayment())
                    .setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal totalInterest = totalCost
                .subtract(simulation.getPropertyValue())
                .setScale(2, RoundingMode.HALF_UP);

        return FinancingSimulation.builder()
                .simulation(simulation)
                .termMonths(dto.getTermMonths())
                .annualInterestRate(dto.getAnnualInterestRate())
                .amortizationType(dto.getAmortizationType())
                .installmentValue(installmentValue)
                .totalCost(totalCost)
                .totalInterest(totalInterest)
                .build();
    }

    /**
     * Converts annual interest rate (e.g. 10.5) to monthly rate using compound interest.
     * Formula: i_monthly = (1 + i_annual) ^ (1/12) - 1
     */
    private BigDecimal toMonthlyRate(BigDecimal annualRate) {
        double annual = annualRate.doubleValue() / 100.0;
        double monthly = Math.pow(1.0 + annual, 1.0 / 12.0) - 1.0;
        return BigDecimal.valueOf(monthly);
    }

    /**
     * PRICE system: fixed installment.
     * Formula: PMT = PV * [i * (1+i)^n] / [(1+i)^n - 1]
     */
    private BigDecimal calculatePriceInstallment(BigDecimal pv, BigDecimal rate, int n) {
        double pvD = pv.doubleValue();
        double iD = rate.doubleValue();
        double factor = Math.pow(1.0 + iD, n);
        double pmt = pvD * (iD * factor) / (factor - 1.0);
        return BigDecimal.valueOf(pmt).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * SAC system: first (highest) installment.
     * Amortization = PV / n (constant)
     * First installment = amortization + (PV * i)
     */
    private BigDecimal calculateSACFirstInstallment(BigDecimal pv, BigDecimal rate, int n) {
        double pvD = pv.doubleValue();
        double amortization = pvD / n;
        double interest = pvD * rate.doubleValue();
        return BigDecimal.valueOf(amortization + interest).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * SAC system: sum of all installments.
     * Total = PV + (i * PV * (n + 1)) / 2
     * (arithmetic progression of interest payments)
     */
    private BigDecimal calculateSACTotalCost(BigDecimal pv, BigDecimal rate, int n) {
        double pvD = pv.doubleValue();
        double iD = rate.doubleValue();
        double totalInterest = iD * pvD * (n + 1) / 2.0;
        return BigDecimal.valueOf(pvD + totalInterest).setScale(2, RoundingMode.HALF_UP);
    }
}