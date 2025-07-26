package com.proxask.service;

import com.proxask.dto.auth.LoginRequest;
import com.proxask.dto.auth.RegisterRequest;
import com.proxask.entity.User;
import com.proxask.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.text.html.parser.Entity;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(RegisterRequest registerRequest){
        User user = new User();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setUsername(registerRequest.getUsername());
        user.setPassword(registerRequest.getPassword());
        user.setBio(registerRequest.getBio());
        user.setAvatar(registerRequest.getAvatar());
        return userRepository.save(user);
    }

    public Optional<User> registerUser(LoginRequest loginRequest){
        return userRepository.findByUsername(loginRequest.getUsername());
    }

}
