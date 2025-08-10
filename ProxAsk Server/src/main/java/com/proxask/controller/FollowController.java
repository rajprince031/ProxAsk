package com.proxask.controller;


import com.proxask.entity.Follow;
import com.proxask.entity.User;
import com.proxask.service.follow.FollowService;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FollowController {

    private final UserService userService;
    private final FollowService followService;

    @PostMapping("/follow/{userId}")
    public ResponseEntity<String> followUSer(@PathVariable String userId){
        Follow followDetails = followService.followUser(userId);
        return ResponseEntity.ok(String.format("Successfully followed user with ID %s.",userId));
    }

    @PostMapping("/unfollow/{userId}")
    public ResponseEntity<String> unfollowUSer(@PathVariable String userId){
        followService.unfollowUser(userId);
        return ResponseEntity.ok(String.format("Successfully unfollowed user with ID %s.",userId));
    }

    @GetMapping("/follower/{username}")
    public List<String> getAllFollower(@PathVariable String username){
        return followService.getAllFollower(username);
    }

    @GetMapping("/following/{username}")
    public List<String> getAllFollowing(@PathVariable String username){
        return followService.getAllFollowing(username);
    }
}
