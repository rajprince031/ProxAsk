package com.proxask.controller;

import com.proxask.dto.response.ApiResponse;
import com.proxask.entity.Follow;
import com.proxask.enums.FollowStatus;
import com.proxask.service.follow.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping({"/follow/{userIdentifier}", "/api/follow/{userIdentifier}"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> followUser(@PathVariable String userIdentifier) {
        Follow follow = followService.followUser(userIdentifier);
        boolean isPending = follow.getStatus() == FollowStatus.PENDING;
        String message = isPending ? "Follow request sent" : "Successfully followed user: " + userIdentifier;
        Map<String, Object> data = Map.of(
                "status", follow.getStatus().name(),
                "target", userIdentifier,
                "isPending", isPending
        );
        return ResponseEntity.ok(new ApiResponse<>(true, message, data));
    }

    @PostMapping({"/unfollow/{userIdentifier}", "/api/unfollow/{userIdentifier}"})
    public ResponseEntity<ApiResponse<String>> unfollowUser(@PathVariable String userIdentifier) {
        followService.unfollowUser(userIdentifier);
        return ResponseEntity.ok(new ApiResponse<>(true, "Successfully unfollowed user: " + userIdentifier, userIdentifier));
    }

    @GetMapping({"/follower/{username}", "/api/follower/{username}", "/followers/{username}", "/api/followers/{username}"})
    public ResponseEntity<ApiResponse<List<String>>> getAllFollowers(@PathVariable String username) {
        List<String> followers = followService.getAllFollower(username);
        return ResponseEntity.ok(new ApiResponse<>(true, "Followers retrieved", followers));
    }

    @GetMapping({"/following/{username}", "/api/following/{username}"})
    public ResponseEntity<ApiResponse<List<String>>> getAllFollowing(@PathVariable String username) {
        List<String> following = followService.getAllFollowing(username);
        return ResponseEntity.ok(new ApiResponse<>(true, "Following retrieved", following));
    }

    @GetMapping({"/follow/requests", "/api/follow/requests"})
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPendingRequests() {
        List<Map<String, Object>> requests = followService.getPendingRequests();
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending follow requests retrieved", requests));
    }

    @GetMapping({"/follow/requests/count", "/api/follow/requests/count"})
    public ResponseEntity<ApiResponse<Long>> countPendingRequests() {
        long count = followService.countPendingRequests();
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending follow requests count retrieved", count));
    }

    @PostMapping({"/follow/request/{id}/accept", "/api/follow/request/{id}/accept"})
    public ResponseEntity<ApiResponse<String>> acceptFollowRequest(@PathVariable String id) {
        followService.acceptFollowRequest(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Follow request accepted", id));
    }

    @PostMapping({"/follow/request/{id}/decline", "/api/follow/request/{id}/decline"})
    public ResponseEntity<ApiResponse<String>> declineFollowRequest(@PathVariable String id) {
        followService.declineFollowRequest(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Follow request declined", id));
    }

    @GetMapping({"/follow/status/{userIdentifier}", "/api/follow/status/{userIdentifier}"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFollowStatus(@PathVariable String userIdentifier) {
        Map<String, Object> status = followService.getFollowStatus(userIdentifier);
        return ResponseEntity.ok(new ApiResponse<>(true, "Follow status retrieved", status));
    }

    @PostMapping({"/user/make-public", "/api/user/make-public"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> makePublic() {
        int acceptedCount = followService.makePublicAndAcceptAllRequests();
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Profile is now public. " + acceptedCount + " pending follow requests have been accepted.",
                Map.of("acceptedRequestsCount", acceptedCount, "isPrivate", false)
        ));
    }
}
