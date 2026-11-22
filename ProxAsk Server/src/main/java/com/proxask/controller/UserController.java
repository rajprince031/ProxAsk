package com.proxask.controller;

import com.proxask.dto.UserDTO;
import com.proxask.dto.response.ApiResponse;
import com.proxask.service.auth.AccountSecurityService;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AccountSecurityService accountSecurityService;

    @GetMapping({"/user/{identifier}", "/api/user/{identifier}"})
    public ResponseEntity<ApiResponse<UserDTO>> getUserDetails(@PathVariable String identifier) {
        UserDTO userDTO = userService.getUserDetails(identifier);
        return ResponseEntity.ok(new ApiResponse<>(true, "User details retrieved", userDTO));
    }

    @PutMapping({"/user/profile", "/api/user/profile"})
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(@RequestBody UserDTO profileDTO) {
        UserDTO updated = userService.updateProfile(profileDTO);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", updated));
    }

    @PutMapping({"/user/privacy", "/api/user/privacy"})
    public ResponseEntity<ApiResponse<UserDTO>> updatePrivacy(@RequestBody Map<String, Boolean> body) {
        boolean isPrivate = body != null && Boolean.TRUE.equals(body.get("isPrivate"));
        UserDTO updated = userService.updatePrivacy(isPrivate);
        return ResponseEntity.ok(new ApiResponse<>(true, "Privacy updated successfully", updated));
    }

    @PostMapping({"/user/avatar", "/api/user/avatar"})
    public ResponseEntity<Map<String, Object>> updateAvatar(
            @RequestParam(value = "avatar", required = false) MultipartFile file,
            @RequestBody(required = false) Map<String, String> body) {
        String avatarUrl = null;
        if (file != null && !file.isEmpty()) {
            try {
                String base64 = Base64.getEncoder().encodeToString(file.getBytes());
                String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
                avatarUrl = "data:" + contentType + ";base64," + base64;
            } catch (IOException e) {
                throw new IllegalArgumentException("Failed to read avatar file");
            }
        } else if (body != null && body.containsKey("avatarUrl")) {
            avatarUrl = body.get("avatarUrl");
        }

        if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Avatar file or avatarUrl is required");
        }

        UserDTO updated = userService.updateAvatar(avatarUrl);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Avatar updated successfully",
                "avatarUrl", avatarUrl,
                "user", updated
        ));
    }

    @PostMapping({"/user/change-password/request-otp", "/api/user/change-password/request-otp"})
    public ResponseEntity<ApiResponse<Void>> requestPasswordChangeOtp() {
        accountSecurityService.requestPasswordChangeOtp();
        return ResponseEntity.ok(new ApiResponse<>(true, "Verification code sent to your registered email address.", null));
    }

    @PostMapping({"/user/change-password", "/api/user/change-password"})
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody Map<String, Object> body) {
        Object otpObj = body.get("otp");
        int otp = otpObj instanceof Number ? ((Number) otpObj).intValue() : Integer.parseInt(String.valueOf(otpObj));
        String newPassword = (String) body.get("newPassword");
        accountSecurityService.changePassword(otp, newPassword);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password updated successfully.", null));
    }

    @PostMapping({"/user/change-email/request-otp", "/api/user/change-email/request-otp"})
    public ResponseEntity<ApiResponse<Void>> requestEmailChangeOtp(@RequestBody Map<String, String> body) {
        String newEmail = body != null ? body.get("newEmail") : null;
        accountSecurityService.requestEmailChangeOtp(newEmail);
        return ResponseEntity.ok(new ApiResponse<>(true, "Verification code sent to " + newEmail, null));
    }

    @PostMapping({"/user/change-email/verify", "/api/user/change-email/verify"})
    public ResponseEntity<ApiResponse<Void>> verifyEmailChange(@RequestBody Map<String, Object> body) {
        String newEmail = (String) body.get("newEmail");
        Object otpObj = body.get("otp");
        int otp = otpObj instanceof Number ? ((Number) otpObj).intValue() : Integer.parseInt(String.valueOf(otpObj));
        accountSecurityService.verifyEmailChange(newEmail, otp);
        return ResponseEntity.ok(new ApiResponse<>(true, "Email address has been successfully updated.", null));
    }

    @GetMapping({"/user/suggested", "/api/user/suggested", "/users/suggested", "/api/users/suggested"})
    public ResponseEntity<ApiResponse<List<UserDTO>>> getSuggestedUsers() {
        List<UserDTO> suggested = userService.getSuggestedUsers();
        return ResponseEntity.ok(new ApiResponse<>(true, "Suggested users retrieved", suggested));
    }

    @GetMapping({"/user/search", "/api/user/search", "/explore/search", "/api/explore/search"})
    public ResponseEntity<ApiResponse<List<UserDTO>>> searchUsers(@RequestParam String q) {
        List<UserDTO> results = userService.searchUsers(q);
        return ResponseEntity.ok(new ApiResponse<>(true, "Search results retrieved", results));
    }
}
