package com.utfpr.casacerta_api.controller;

import com.utfpr.casacerta_api.dto.AuthRequestDTO;
import com.utfpr.casacerta_api.dto.AuthResponseDTO;
import com.utfpr.casacerta_api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody @Valid AuthRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }
}
