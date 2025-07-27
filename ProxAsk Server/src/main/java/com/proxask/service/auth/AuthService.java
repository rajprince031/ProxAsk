package com.proxask.service.auth;

import com.proxask.dto.UserDTO;
import com.proxask.dto.auth.AuthResponse;
import com.proxask.dto.auth.LoginRequest;
import com.proxask.dto.auth.RegisterRequest;
import com.proxask.entity.User;
import com.proxask.repository.UserRepository;
import com.proxask.service.jwt.JWTService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private ModelMapper modelMapper;


    @Transactional
    public ResponseEntity<UserDTO> registerUser(RegisterRequest registerRequest){
        try {
            registerRequest.setPassword(bCryptPasswordEncoder.encode(registerRequest.getPassword()));
            User user = modelMapper.map(registerRequest, User.class);
            User newUser = userRepository.save(user);
            UserDTO userDTO = modelMapper.map(newUser, UserDTO.class);
            return ResponseEntity.ok(userDTO);
        }catch (Exception e){
            System.out.println(e);
            return ResponseEntity
                    .internalServerError()
                    .body(new UserDTO());
        }
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
