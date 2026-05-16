package com.utfpr.casacerta_api.controller;

import com.utfpr.casacerta_api.dto.SimulationRequestDTO;
import com.utfpr.casacerta_api.dto.SimulationResponseDTO;
import com.utfpr.casacerta_api.service.SimulationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/simulations")
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    /**
     * POST /api/simulations
     * Runs a new simulation comparing financing vs. consortium.
     */
    @PostMapping
    public ResponseEntity<SimulationResponseDTO> simulate(@Valid @RequestBody SimulationRequestDTO dto) {
        SimulationResponseDTO response = simulationService.simulate(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/simulations/{id}
     * Returns a previously saved simulation by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SimulationResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(simulationService.findById(id));
    }

    /**
     * GET /api/simulations?userId={userId}
     * Returns all simulations for a given user.
     */
    @GetMapping
    public ResponseEntity<List<SimulationResponseDTO>> findByUser(@RequestParam Long userId) {
        return ResponseEntity.ok(simulationService.findByUserId(userId));
    }
}