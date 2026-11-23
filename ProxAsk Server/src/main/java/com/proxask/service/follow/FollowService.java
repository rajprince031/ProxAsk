package com.proxask.service.follow;

import com.proxask.entity.Follow;
import com.proxask.entity.User;
import com.proxask.enums.FollowStatus;
import com.proxask.exception.AlreadyFollowingException;
import com.proxask.exception.FollowNotFoundException;
import com.proxask.exception.NotFollowingException;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.jpa.FollowRepository;
import com.proxask.repository.jpa.UserRepository;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public Follow followUser(String targetIdentifier) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to follow");
        }

        User targetUser = resolveUser(targetIdentifier);

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new IllegalArgumentException("You can't follow yourself.");
        }

        Optional<Follow> existing = followRepository.findByFollowerAndFollowing(currentUser, targetUser);
        if (existing.isPresent()) {
            Follow f = existing.get();
            if (f.getStatus() == FollowStatus.ACCEPTED) {
                throw new AlreadyFollowingException("You are already following this user.");
            }
            if (f.getStatus() == FollowStatus.PENDING) {
                return f; // Already pending
            }
            // If declined previously, reactivate request
            boolean isTargetPrivate = Boolean.TRUE.equals(targetUser.getIsPrivate());
            f.setStatus(isTargetPrivate ? FollowStatus.PENDING : FollowStatus.ACCEPTED);
            return followRepository.save(f);
        }

        boolean isTargetPrivate = Boolean.TRUE.equals(targetUser.getIsPrivate());
        FollowStatus initialStatus = isTargetPrivate ? FollowStatus.PENDING : FollowStatus.ACCEPTED;

        Follow follow = new Follow(currentUser, targetUser, initialStatus);
        return followRepository.save(follow);
    }

    @Transactional
    public void unfollowUser(String targetIdentifier) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to unfollow");
        }

        User targetUser = resolveUser(targetIdentifier);

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new IllegalArgumentException("You can't unfollow yourself.");
        }

        Follow follow = followRepository.findByFollowerAndFollowing(currentUser, targetUser)
                .orElseThrow(() -> new NotFollowingException("You are not following this user."));

        followRepository.delete(follow);
    }

    @Transactional(readOnly = true)
    public Boolean isFollowing(User follower, User following) {
        return followRepository.existsByFollowerAndFollowingAndStatus(follower, following, FollowStatus.ACCEPTED);
    }

    @Transactional(readOnly = true)
    public List<String> getAllFollower(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new ResourceNotFoundException("Username does not exist: " + username)
        );
        List<Follow> followers = followRepository.findByFollowingAndStatus(user, FollowStatus.ACCEPTED);
        return followers.stream().map(f -> f.getFollower().getUsername()).toList();
    }

    @Transactional(readOnly = true)
    public List<String> getAllFollowing(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new ResourceNotFoundException("Username does not exist: " + username)
        );
        List<Follow> followings = followRepository.findByFollowerAndStatus(user, FollowStatus.ACCEPTED);
        return followings.stream().map(f -> f.getFollowing().getUsername()).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingRequests() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to view follow requests.");
        }

        List<Follow> pending = followRepository.findByFollowingAndStatus(currentUser, FollowStatus.PENDING);
        return pending.stream().map(f -> {
            User requester = f.getFollower();
            Map<String, Object> map = new HashMap<>();
            map.put("requestId", f.getId());
            map.put("id", requester.getId());
            map.put("username", requester.getUsername());
            map.put("firstName", requester.getFirstName());
            map.put("lastName", requester.getLastName());
            map.put("avatar", requester.getAvatar());
            map.put("bio", requester.getBio());
            map.put("requestedAt", f.getFollowedAt());
            return map;
        }).toList();
    }

    @Transactional(readOnly = true)
    public long countPendingRequests() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            return 0;
        }
        return followRepository.countByFollowingAndStatus(currentUser, FollowStatus.PENDING);
    }

    @Transactional
    public void acceptFollowRequest(String requestId) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to accept requests.");
        }

        Follow follow = followRepository.findById(requestId)
                .orElseThrow(() -> new FollowNotFoundException("Follow request not found"));

        if (!follow.getFollowing().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to accept this follow request.");
        }

        follow.setStatus(FollowStatus.ACCEPTED);
        followRepository.save(follow);
    }

    @Transactional
    public void declineFollowRequest(String requestId) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to decline requests.");
        }

        Follow follow = followRepository.findById(requestId)
                .orElseThrow(() -> new FollowNotFoundException("Follow request not found"));

        if (!follow.getFollowing().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to decline this follow request.");
        }

        followRepository.delete(follow);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFollowStatus(String targetIdentifier) {
        User targetUser = resolveUser(targetIdentifier);
        long followersCount = followRepository.countByFollowingAndStatus(targetUser, FollowStatus.ACCEPTED);
        long followingCount = followRepository.countByFollowerAndStatus(targetUser, FollowStatus.ACCEPTED);

        User currentUser = userService.getCurrentAuthenticatedUser();
        String status = "NONE";

        if (currentUser != null && !currentUser.getId().equals(targetUser.getId())) {
            Optional<Follow> f = followRepository.findByFollowerAndFollowing(currentUser, targetUser);
            if (f.isPresent()) {
                if (f.get().getStatus() == FollowStatus.ACCEPTED) {
                    status = "FOLLOWING";
                } else if (f.get().getStatus() == FollowStatus.PENDING) {
                    status = "REQUESTED";
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("status", status);
        result.put("followersCount", followersCount);
        result.put("followingCount", followingCount);
        result.put("isPrivate", Boolean.TRUE.equals(targetUser.getIsPrivate()));
        return result;
    }

    @Transactional
    public int makePublicAndAcceptAllRequests() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to update privacy.");
        }

        currentUser.setIsPrivate(false);
        userRepository.save(currentUser);

        List<Follow> pending = followRepository.findByFollowingAndStatus(currentUser, FollowStatus.PENDING);
        for (Follow f : pending) {
            f.setStatus(FollowStatus.ACCEPTED);
        }
        followRepository.saveAll(pending);
        return pending.size();
    }

    private User resolveUser(String identifier) {
        return userRepository.findById(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + identifier));
    }
}
