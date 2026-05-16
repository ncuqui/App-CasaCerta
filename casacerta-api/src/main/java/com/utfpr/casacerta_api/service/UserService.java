package com.utfpr.casacerta_api.service;

import com.utfpr.casacerta_api.dto.UserRequestDTO;
import com.utfpr.casacerta_api.dto.UserResponseDTO;
import com.utfpr.casacerta_api.entity.User;
import com.utfpr.casacerta_api.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponseDTO create(UserRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .monthlyIncome(dto.getMonthlyIncome())
                .downPayment(dto.getDownPayment())
                .build();

        return toResponseDTO(userRepository.save(user));
    }

    public UserResponseDTO findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toResponseDTO(user);
    }

    public List<UserResponseDTO> findAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public UserResponseDTO findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));
        return toResponseDTO(user);
    }

    public UserResponseDTO update(Long id, UserRequestDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setMonthlyIncome(dto.getMonthlyIncome());
        user.setDownPayment(dto.getDownPayment());

        return toResponseDTO(userRepository.save(user));
    }

    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    private UserResponseDTO toResponseDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .monthlyIncome(user.getMonthlyIncome())
                .downPayment(user.getDownPayment())
                .build();
    }
}