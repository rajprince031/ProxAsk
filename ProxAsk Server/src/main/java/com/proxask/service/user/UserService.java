package com.proxask.service.user;

import com.proxask.dto.UserDTO;
import com.proxask.entity.User;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.AnswerRepository;
import com.proxask.repository.FollowRepository;
import com.proxask.repository.QuestionRepository;
import com.proxask.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final QuestionRepository questionRepository;
    private final ModelMapper modelMapper;

    @Transactional(readOnly = true)
    public UserDTO getUserDetails(String identifier) {
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findById(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + identifier));
        UserDTO dto = toUserDTO(user);

        User caller = getCurrentAuthenticatedUser();
        boolean isOwner = caller != null && caller.getId().equals(user.getId());
        boolean isFollowing = caller != null && followRepository.existsByFollowerAndFollowing(caller, user);

        if (Boolean.TRUE.equals(user.getIsPrivate()) && !isOwner && !isFollowing) {
            dto.setEmail(null);
        }

        return dto;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() ->
                new UsernameNotFoundException("Email does not exist: " + email));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() ->
                new ResourceNotFoundException("User not found: " + username));
    }

    public String getUserId(String username) {
        return getUserByUsername(username).getId();
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal != null ? principal.toString() : null;
        }

        if (username == null || username.equalsIgnoreCase("anonymousUser")) {
            return null;
        }

        return userRepository.findByUsername(username).orElse(null);
    }

    @Transactional
    public UserDTO updateProfile(UserDTO updateRequest) {
        User currentUser = getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to update profile.");
        }

        if (updateRequest.getFirstName() != null && !updateRequest.getFirstName().trim().isEmpty()) {
            currentUser.setFirstName(updateRequest.getFirstName().trim());
        }
        if (updateRequest.getLastName() != null) {
            currentUser.setLastName(updateRequest.getLastName().trim());
        }
        if (updateRequest.getBio() != null) {
            currentUser.setBio(updateRequest.getBio().trim());
        }
        if (updateRequest.getLocation() != null) {
            currentUser.setLocation(updateRequest.getLocation().trim());
        }
        if (updateRequest.getWebsite() != null) {
            currentUser.setWebsite(updateRequest.getWebsite().trim());
        }
        if (updateRequest.getAvatar() != null && !updateRequest.getAvatar().trim().isEmpty()) {
            currentUser.setAvatar(updateRequest.getAvatar().trim());
        }
        if (updateRequest.getIsPrivate() != null) {
            currentUser.setIsPrivate(updateRequest.getIsPrivate());
        }

        User saved = userRepository.save(currentUser);
        return toUserDTO(saved);
    }

    @Transactional
    public UserDTO updatePrivacy(boolean isPrivate) {
        User currentUser = getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to update privacy.");
        }
        currentUser.setIsPrivate(isPrivate);
        User saved = userRepository.save(currentUser);
        return toUserDTO(saved);
    }

    @Transactional
    public UserDTO updateAvatar(String avatarUrl) {
        User currentUser = getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to update avatar.");
        }
        currentUser.setAvatar(avatarUrl);
        User saved = userRepository.save(currentUser);
        return toUserDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getSuggestedUsers() {
        User currentUser = getCurrentAuthenticatedUser();
        List<User> topUsers = userRepository.findTop10ByOrderByCreatedAtDesc();
        return topUsers.stream()
                .filter(u -> currentUser == null || !u.getId().equals(currentUser.getId()))
                .map(this::toUserDTO)
                .limit(5)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserDTO> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        String clean = query.trim();
        List<User> found = userRepository.findByUsernameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(clean, clean, clean);
        return found.stream().map(this::toUserDTO).toList();
    }

    public UserDTO toUserDTO(User user) {
        UserDTO dto = modelMapper.map(user, UserDTO.class);
        long followersCount = followRepository.countByFollowingAndStatus(user, com.proxask.enums.FollowStatus.ACCEPTED);
        long followingCount = followRepository.countByFollowerAndStatus(user, com.proxask.enums.FollowStatus.ACCEPTED);
        long questionsCount = questionRepository.findByReceiver(user).size();

        dto.setFollowersCount(followersCount);
        dto.setFollowingCount(followingCount);
        dto.setQuestionsCount(questionsCount);
        dto.setAnswersCount(0L);
        dto.setIsPrivate(user.getIsPrivate() != null ? user.getIsPrivate() : false);
        return dto;
    }
}
