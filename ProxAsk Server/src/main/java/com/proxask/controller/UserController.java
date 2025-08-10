package com.proxask.controller;


import com.proxask.dto.UserDTO;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<UserDTO> getUserDetails(@PathVariable String username){
        UserDTO userDTO = userService.getUserDetails(username);
        return ResponseEntity.ok(userDTO);
    }


    @GetMapping()
    public ResponseEntity<?> testing(){
        return new ResponseEntity<>("Hello I am user controller", HttpStatus.valueOf(200));
    }
}
