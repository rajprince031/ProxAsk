package com.proxask.repository;

import com.proxask.entity.Follow;
import com.proxask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, String> {

    List<Follow> findByFollower(User follower);
    List<Follow> findByFollowing(User following);

    Boolean existsByFollowerAndFollowing(User follower,User following);

    Optional<Follow> findByFollowerAndFollowing(User follower,User following);
}
