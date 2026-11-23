package com.proxask.repository.jpa;

import com.proxask.entity.Follow;
import com.proxask.entity.User;
import com.proxask.enums.FollowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, String> {

    List<Follow> findByFollower(User follower);
    List<Follow> findByFollowing(User following);

    List<Follow> findByFollowerAndStatus(User follower, FollowStatus status);
    List<Follow> findByFollowingAndStatus(User following, FollowStatus status);

    Boolean existsByFollowerAndFollowing(User follower, User following);
    Boolean existsByFollowerAndFollowingAndStatus(User follower, User following, FollowStatus status);

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    long countByFollowingAndStatus(User following, FollowStatus status);
    long countByFollowerAndStatus(User follower, FollowStatus status);
}
