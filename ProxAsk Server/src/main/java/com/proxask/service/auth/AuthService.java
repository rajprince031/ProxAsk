package com.proxask.service.auth;

import com.proxask.dto.UserDTO;
import com.proxask.dto.auth.AuthResponse;
import com.proxask.dto.auth.LoginRequest;
import com.proxask.dto.auth.RegisterRequest;
import com.proxask.entity.User;
import com.proxask.repository.EmailVerificationRepository;
import com.proxask.repository.UserRepository;
import com.proxask.service.jwt.JWTService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;
    private final ModelMapper modelMapper;
    private final OtpService otpService;
    private final EmailVerificationRepository emailVerificationRepository;
    private final VerificationSupportService verificationSupportService;

    @Transactional
    public UserDTO registerUser(RegisterRequest registerRequest){

        verificationSupportService.cleanupUnverifiedConflicts(
                registerRequest.getEmail(),
                registerRequest.getUsername()
        );

        registerRequest.setPassword(bCryptPasswordEncoder.encode(registerRequest.getPassword()));
        User user = modelMapper.map(registerRequest, User.class);
        User newUser = userRepository.save(user);
        UserDTO userDTO = modelMapper.map(newUser, UserDTO.class);
        otpService.sendOtp(newUser);
        return userDTO;
    }

    public ResponseEntity<AuthResponse> loginUser(LoginRequest loginRequest){
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword())
                );
        if(!authentication.isAuthenticated())
            return ResponseEntity.status(401).body(new AuthResponse());

        String username = loginRequest.getUsername();
        AuthResponse authResponse = new AuthResponse(
                jwtService.generateToken(username),username
        );
        return ResponseEntity.ok(authResponse);
    }


}
