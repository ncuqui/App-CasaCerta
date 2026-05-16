package com.utfpr.casacerta_api.entity;

import com.utfpr.casacerta_api.enums.RecommendationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "simulations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Simulation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "property_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal propertyValue;

    @Column(name = "down_payment", nullable = false, precision = 15, scale = 2)
    private BigDecimal downPayment;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation")
    private RecommendationType recommendation;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "simulation", cascade = CascadeType.ALL, orphanRemoval = true)
    private FinancingSimulation financing;

    @OneToOne(mappedBy = "simulation", cascade = CascadeType.ALL, orphanRemoval = true)
    private ConsortiumSimulation consortium;
}