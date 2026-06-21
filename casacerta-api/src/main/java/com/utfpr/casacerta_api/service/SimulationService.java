package com.utfpr.casacerta_api.service;

import com.utfpr.casacerta_api.dto.SimulationRequestDTO;
import com.utfpr.casacerta_api.dto.SimulationResponseDTO;
import com.utfpr.casacerta_api.entity.ConsortiumSimulation;
import com.utfpr.casacerta_api.entity.FinancingSimulation;
import com.utfpr.casacerta_api.entity.Simulation;
import com.utfpr.casacerta_api.entity.User;
import com.utfpr.casacerta_api.enums.RecommendationType;
import com.utfpr.casacerta_api.repository.SimulationRepository;
import com.utfpr.casacerta_api.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SimulationService {

    private final SimulationRepository simulationRepository;
    private final UserRepository userRepository;
    private final FinancingService financingService;
    private final ConsortiumService consortiumService;

    @Transactional
    public SimulationResponseDTO simulate(SimulationRequestDTO dto) {
        if (dto.getFinancing() == null && dto.getConsortium() == null) {
            throw new IllegalArgumentException("At least one modality (financing or consortium) must be provided.");
        }

        if (dto.getDownPayment() != null && dto.getPropertyValue() != null
                && dto.getDownPayment().compareTo(dto.getPropertyValue()) >= 0) {
            throw new IllegalArgumentException("Down payment must be less than property value.");
        }

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getUserId()));

        // Build the parent simulation first
        Simulation simulation = Simulation.builder()
                .user(user)
                .propertyValue(dto.getPropertyValue())
                .downPayment(dto.getDownPayment())
                .build();

        // Calculate available modalities
        FinancingSimulation financing = null;
        ConsortiumSimulation consortium = null;

        if (dto.getFinancing() != null) {
            financing = financingService.calculate(simulation, dto.getFinancing());
            simulation.setFinancing(financing);
        }

        if (dto.getConsortium() != null) {
            consortium = consortiumService.calculate(simulation, dto.getConsortium());
            simulation.setConsortium(consortium);
        }

        // Determine recommendation
        RecommendationType recommendation;
        if (financing != null && consortium != null) {
            recommendation = financing.getTotalCost()
                    .compareTo(consortium.getTotalCost()) <= 0
                    ? RecommendationType.FINANCING
                    : RecommendationType.CONSORTIUM;
        } else if (financing != null) {
            recommendation = RecommendationType.FINANCING;
        } else {
            recommendation = RecommendationType.CONSORTIUM;
        }

        simulation.setRecommendation(recommendation);

        Simulation saved = simulationRepository.save(simulation);
        return toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public SimulationResponseDTO findById(Long id) {
        Simulation simulation = simulationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Simulation not found with id: " + id));
        return toResponseDTO(simulation);
    }

    @Transactional(readOnly = true)
    public List<SimulationResponseDTO> findByUserId(Long userId) {
        return simulationRepository.findByUserId(userId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public void deleteById(Long id) {
        if (!simulationRepository.existsById(id)) {
            throw new EntityNotFoundException("Simulation not found with id: " + id);
        }
        simulationRepository.deleteById(id);
    }

    // -------------------------------------------------------------------------
    // Mapping
    // -------------------------------------------------------------------------

    private SimulationResponseDTO toResponseDTO(Simulation simulation) {
        FinancingSimulation f = simulation.getFinancing();
        ConsortiumSimulation c = simulation.getConsortium();

        SimulationResponseDTO.SimulationResponseDTOBuilder builder = SimulationResponseDTO.builder()
                .id(simulation.getId())
                .propertyValue(simulation.getPropertyValue())
                .downPayment(simulation.getDownPayment())
                .recommendation(simulation.getRecommendation())
                .createdAt(simulation.getCreatedAt());

        if (f != null) {
            builder.financing(SimulationResponseDTO.FinancingResultDTO.builder()
                    .termMonths(f.getTermMonths())
                    .annualInterestRate(f.getAnnualInterestRate())
                    .amortizationType(f.getAmortizationType())
                    .installmentValue(f.getInstallmentValue())
                    .totalCost(f.getTotalCost())
                    .totalInterest(f.getTotalInterest())
                    .build());
        }

        if (c != null) {
            builder.consortium(SimulationResponseDTO.ConsortiumResultDTO.builder()
                    .termMonths(c.getTermMonths())
                    .annualAdminFee(c.getAnnualAdminFee())
                    .reserveFund(c.getReserveFund())
                    .bidPercentage(c.getBidPercentage())
                    .monthlyContribution(c.getMonthlyContribution())
                    .totalCost(c.getTotalCost())
                    .totalAdminFee(c.getTotalAdminFee())
                    .build());
        }

        return builder.build();
    }
}