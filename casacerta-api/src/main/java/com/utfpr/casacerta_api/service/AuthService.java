package com.utfpr.casacerta_api.service;

import com.utfpr.casacerta_api.dto.AuthRequestDTO;
import com.utfpr.casacerta_api.dto.AuthResponseDTO;
import com.utfpr.casacerta_api.dto.UserResponseDTO;
import com.utfpr.casacerta_api.entity.User;
import com.utfpr.casacerta_api.repository.UserRepository;
import com.utfpr.casacerta_api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponseDTO login(AuthRequestDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("E-mail ou senha incorretos."));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("E-mail ou senha incorretos.");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        UserResponseDTO userDTO = UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .monthlyIncome(user.getMonthlyIncome())
                .downPayment(user.getDownPayment())
                .build();

        return new AuthResponseDTO(token, userDTO);
    }
}
