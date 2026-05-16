package com.utfpr.casacerta_api.repository;

import com.utfpr.casacerta_api.entity.Simulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimulationRepository extends JpaRepository<Simulation, Long> {

    List<Simulation> findByUserId(Long userId);
}