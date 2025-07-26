package com.proxask.controller;


import com.proxask.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserDetails(@PathVariable String username){
        return userService.getUserDetails(username);
    }

    @GetMapping()
    public ResponseEntity<?> testing(){
        return new ResponseEntity<>("Hello I am user controller", HttpStatus.valueOf(200));
    }
}
