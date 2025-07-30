package com.proxask.service.user;

import com.proxask.dto.UserDTO;
import com.proxask.dto.auth.AuthResponse;
import com.proxask.dto.auth.LoginRequest;
import com.proxask.dto.auth.RegisterRequest;
import com.proxask.dto.question.QuestionDTO;
import com.proxask.entity.User;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.UserRepository;
import com.proxask.service.jwt.JWTService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    public UserDTO getUserDetails(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() ->
               new ResourceNotFoundException("User not found"));
        return modelMapper.map(user, UserDTO.class);
    }

    public String getUserId(String username){
        return userRepository.findByUsername(username).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        ).getId();
    }

    public User getCurrentAuthenticatedUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username =  ((UserDetails) principal).getUsername();
        } else {
            username =  principal.toString();
        }
        return userRepository.findByUsername(username).orElseThrow(() ->
                new ResourceNotFoundException("User not found with username: " + username));
    }

}
