package com.proxask;

import com.proxask.controller.AuthController;
import com.proxask.dto.UserDTO;
import com.proxask.dto.auth.AuthResponse;
import com.proxask.dto.auth.LoginRequest;
import com.proxask.dto.auth.SessionResponseDTO;
import com.proxask.entity.User;
import com.proxask.entity.UserSession;
import com.proxask.mapper.UserMapper;
import com.proxask.service.auth.AccountSecurityService;
import com.proxask.service.auth.AuthService;
import com.proxask.service.auth.SessionService;
import com.proxask.service.jwt.JWTService;
import com.proxask.service.user.UserService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerSecurityIntegrationTest {

    @Mock
    private AuthService authService;

    @Mock
    private UserService userService;

    @Mock
    private UserMapper userMapper;

    @Mock
    private AccountSecurityService accountSecurityService;

    @Mock
    private SessionService sessionService;

    private JWTService jwtService;
    private MockMvc mockMvc;

    private User testUser;
    private UserDTO testUserDTO;

    @BeforeEach
    void setUp() {
        jwtService = new JWTService(
                "af60addca9ea3e3c099551e1b6576c9966dce0a33de879dd7e160f86dbd872ca236d6e9ee66fb6e30039fe7c345324a10f3d0741b0600fa7a45df4c6691eff4f4209767ed39f51e37717d8feecd5dd14fc34ebe619e6a29ae91d9ffe134cb5718bec0b3680d6ae7fc09e67763fe7c05d05d3ba69f47211163852633755b7f861132b0c98f8d7c1af9152d547408e676867a0a32fb525a4354180f5fb6b2dc23b5faa4155b8db63385f96259a90b6ee0e74a5b90a4f0f4fa96fafc296c64588b5c009b3829ae2e1d69a1cf7569b50a65fa553350495d18816f785f961c970c0a9cb9c8da25cc5e9fa4a3e9527a132d616b232d1ee21c3bf6dc8d9e3376e2e82c0",
                900000L
        );

        AuthController authController = new AuthController(
                authService,
                userService,
                userMapper,
                accountSecurityService,
                sessionService,
                jwtService
        );

        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();

        testUser = new User();
        testUser.setId("u-123");
        testUser.setUsername("alex_creator");
        testUser.setEmail("alex@proxask.com");

        testUserDTO = new UserDTO();
        testUserDTO.setId("u-123");
        testUserDTO.setUsername("alex_creator");
        testUserDTO.setEmail("alex@proxask.com");
    }

    @Test
    @DisplayName("POST /auth/login returns AuthResponse and sets HttpOnly refreshToken cookie")
    void testLoginSetsHttpOnlyCookie() throws Exception {
        UserSession userSession = UserSession.builder()
                .sessionId("session-xyz")
                .user(testUser)
                .build();

        SessionService.SessionTokens sessionTokens = SessionService.SessionTokens.builder()
                .accessToken("access-jwt-token")
                .rawRefreshToken("refresh-raw-token-abc")
                .sessionId("session-xyz")
                .userSession(userSession)
                .build();

        when(authService.loginUser(any(LoginRequest.class), any())).thenReturn(sessionTokens);
        when(userMapper.toDTO(testUser)).thenReturn(testUserDTO);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"alex_creator\",\"password\":\"Password123!\"}"))
                .andExpect(status().isOk())
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("refreshToken=refresh-raw-token-abc")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("HttpOnly")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("SameSite=Strict")))
                .andExpect(jsonPath("$.sessionId").value("session-xyz"))
                .andExpect(jsonPath("$.token").value("access-jwt-token"))
                .andExpect(jsonPath("$.username").value("alex_creator"));
    }

    @Test
    @DisplayName("POST /auth/refresh-token rotates token using HttpOnly cookie and issues fresh cookie")
    void testRefreshTokenRotationEndpoint() throws Exception {
        UserSession userSession = UserSession.builder()
                .sessionId("session-xyz")
                .user(testUser)
                .build();

        SessionService.SessionTokens rotatedTokens = SessionService.SessionTokens.builder()
                .accessToken("new-access-jwt")
                .rawRefreshToken("new-raw-refresh-token")
                .sessionId("session-xyz")
                .userSession(userSession)
                .build();

        when(sessionService.rotateRefreshToken(eq("cookie-raw-token"), any())).thenReturn(rotatedTokens);
        when(userMapper.toDTO(testUser)).thenReturn(testUserDTO);

        mockMvc.perform(post("/auth/refresh-token")
                        .cookie(new Cookie("refreshToken", "cookie-raw-token")))
                .andExpect(status().isOk())
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("refreshToken=new-raw-refresh-token")))
                .andExpect(jsonPath("$.token").value("new-access-jwt"))
                .andExpect(jsonPath("$.sessionId").value("session-xyz"));
    }

    @Test
    @DisplayName("GET /auth/sessions returns active sessions for authenticated user")
    void testGetActiveSessions() throws Exception {
        String token = jwtService.generateTokenWithSession("alex_creator", "sess-1");
        when(userService.getCurrentAuthenticatedUser()).thenReturn(testUser);

        SessionResponseDTO s1 = SessionResponseDTO.builder()
                .sessionId("sess-1")
                .deviceInfo("Chrome on macOS")
                .ipAddress("127.0.0.1")
                .isCurrentSession(true)
                .build();

        when(sessionService.getActiveSessionsForUser(eq(testUser), eq("sess-1"))).thenReturn(List.of(s1));

        mockMvc.perform(get("/auth/sessions")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].sessionId").value("sess-1"))
                .andExpect(jsonPath("$.data[0].deviceInfo").value("Chrome on macOS"))
                .andExpect(jsonPath("$.data[0].currentSession").value(true));
    }

    @Test
    @DisplayName("DELETE /auth/sessions/{id} revokes specific session")
    void testRevokeSessionEndpoint() throws Exception {
        when(userService.getCurrentAuthenticatedUser()).thenReturn(testUser);

        mockMvc.perform(delete("/auth/sessions/sess-remote-9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Session revoked successfully"));

        verify(sessionService).revokeSession("sess-remote-9", testUser);
    }

    @Test
    @DisplayName("DELETE /auth/sessions/other revokes all sessions except current session")
    void testRevokeOtherSessionsEndpoint() throws Exception {
        String token = jwtService.generateTokenWithSession("alex_creator", "sess-current-1");
        when(userService.getCurrentAuthenticatedUser()).thenReturn(testUser);

        mockMvc.perform(delete("/auth/sessions/other")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("All other sessions revoked successfully"));

        verify(sessionService).revokeAllOtherSessions(testUser, "sess-current-1");
    }

    @Test
    @DisplayName("POST /auth/logout clears refresh token cookie and revokes session")
    void testLogoutClearsCookie() throws Exception {
        String token = jwtService.generateTokenWithSession("alex_creator", "sess-to-logout");
        when(userService.getCurrentAuthenticatedUser()).thenReturn(testUser);

        mockMvc.perform(post("/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("Max-Age=0")));

        verify(sessionService).revokeSession("sess-to-logout", testUser);
    }
}
