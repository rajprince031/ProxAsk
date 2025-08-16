package com.proxask.dto.auth;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OtpRequest {
    private int otp;
    private String email;
}
