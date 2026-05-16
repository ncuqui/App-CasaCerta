package com.utfpr.casacerta_api.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;

    @NotNull(message = "Monthly income is required")
    @DecimalMin(value = "0.0", message = "Value must be positive")
    private Double monthlyIncome;

    @NotNull(message = "Down payment is required")
    @DecimalMin(value = "0.0", message = "Value must be positive")
    private Double downPayment;
}