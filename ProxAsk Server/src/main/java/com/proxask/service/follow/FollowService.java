package com.proxask.service.follow;


import com.proxask.entity.Follow;
import com.proxask.entity.User;
import com.proxask.exception.AlreadyFollowingException;
import com.proxask.exception.FollowNotFoundException;
import com.proxask.exception.NotFollowingException;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.FollowRepository;
import com.proxask.repository.UserRepository;
import com.proxask.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FollowService {

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public Follow followUser(String targetUsername) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        User targetUser = userRepository.findByUsername(targetUsername).orElseThrow(() ->
                new ResourceNotFoundException("User not found"));

        if(currentUser.equals(targetUser))
            throw new IllegalArgumentException("You can't follow yourself.");

        if(isFollowing(currentUser, targetUser))
            throw new AlreadyFollowingException("You are already following this user.");

        Follow follow = new Follow(currentUser, targetUser);

        return followRepository.save(follow);
    }

    @Transactional
    public void unfollowUser(String targetUsername){
        User currentUser = userService.getCurrentAuthenticatedUser();
        User targetUser = userRepository.findByUsername(targetUsername).orElseThrow(() ->
                new ResourceNotFoundException("User not found"));

        if(currentUser.equals(targetUser))
            throw new IllegalArgumentException("You can't unfollow/follow yourself.");

        if(!isFollowing(currentUser, targetUser)){
            throw new NotFollowingException("You are not following this user.");
        }
        Follow follow = followRepository.findByFollowerAndFollowing(currentUser, targetUser).orElseThrow(() ->
                new FollowNotFoundException("Follow relationship not found"));

        followRepository.delete(follow);
    }

    public Boolean isFollowing(User follower, User following){
        return followRepository.existsByFollowerAndFollowing(follower, following);
    }

    public List<String> getAllFollower(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        List<Follow> follower =  followRepository.findByFollowing(user);
        return follower.stream().map(f -> f.getFollower().getUsername()).toList();
    }

    public List<String> getAllFollowing(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        List<Follow> follow =  followRepository.findByFollower(user);
        return follow.stream().map(f -> f.getFollowing().getUsername()).toList();
    }

}
