package com.utfpr.casacerta_api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 2, max = 100)
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotNull
    @DecimalMin("0.0")
    @Column(nullable = false)
    private Double monthlyIncome;

    @NotNull
    @DecimalMin("0.0")
    @Column(nullable = false)
    private Double downPayment;

    @Column(name = "password_hash")
    private String passwordHash;
}