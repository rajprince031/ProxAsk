package com.proxask;

import com.proxask.controller.VerificationController;
import com.proxask.dto.auth.OtpRequest;
import com.proxask.entity.User;
import com.proxask.repository.jpa.UserRepository;
import com.proxask.service.auth.VerificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class VerificationControllerTest {

    @Mock
    private VerificationService verificationService;

    @Mock
    private UserRepository userRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        VerificationController controller = new VerificationController(verificationService, userRepository);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /api/auth/verification-status returns ALREADY_VERIFIED for verified user")
    void testVerificationStatusVerified() throws Exception {
        User user = new User();
        user.setEmail("verified@example.com");
        user.setIsVerified(true);

        when(userRepository.findByEmail("verified@example.com")).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/auth/verification-status?email=verified@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Your account is already verified. Please log in."))
                .andExpect(jsonPath("$.data.status").value("ALREADY_VERIFIED"));
    }

    @Test
    @DisplayName("GET /api/auth/verification-status returns PENDING for unverified user within 10-minute window")
    void testVerificationStatusPending() throws Exception {
        User user = new User();
        user.setEmail("pending@example.com");
        user.setIsVerified(false);
        user.setVerified(false);
        user.setOtpExpiry(java.time.Instant.now().plusSeconds(300));

        when(userRepository.findByEmail("pending@example.com")).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/auth/verification-status?email=pending@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Your account is not verified yet. Please enter the OTP (or click the verification link) sent to your email."))
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    @DisplayName("GET /api/auth/verification-status returns EXPIRED when user does not exist or expired")
    void testVerificationStatusExpired() throws Exception {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/auth/verification-status?email=unknown@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Your verification link/OTP has expired. Please register again."))
                .andExpect(jsonPath("$.data.status").value("EXPIRED"));
    }

    @Test
    @DisplayName("GET /api/auth/verify-email with token verifies account successfully")
    void testVerifyEmailToken() throws Exception {
        when(verificationService.verifyTokenWithStatus("sample-valid-token")).thenReturn("VERIFIED");

        mockMvc.perform(get("/api/auth/verify-email?token=sample-valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Account verified and created successfully!"))
                .andExpect(jsonPath("$.data.status").value("VERIFIED"));

        verify(verificationService).verifyTokenWithStatus("sample-valid-token");
    }

    @Test
    @DisplayName("GET /api/auth/verify-email with token already verified returns ALREADY_VERIFIED")
    void testVerifyEmailTokenAlreadyVerified() throws Exception {
        when(verificationService.verifyTokenWithStatus("already-verified-token")).thenReturn("ALREADY_VERIFIED");

        mockMvc.perform(get("/api/auth/verify-email?token=already-verified-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Your account is already verified. Please log in."))
                .andExpect(jsonPath("$.data.status").value("ALREADY_VERIFIED"));

        verify(verificationService).verifyTokenWithStatus("already-verified-token");
    }

    @Test
    @DisplayName("POST /api/auth/verify-email with OTP verifies account successfully")
    void testVerifyEmailOtp() throws Exception {
        doNothing().when(verificationService).verify(anyString(), anyInt());

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"test@example.com\",\"otp\":123456}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Account verified and created successfully!"));

        verify(verificationService).verify("test@example.com", 123456);
    }
}
