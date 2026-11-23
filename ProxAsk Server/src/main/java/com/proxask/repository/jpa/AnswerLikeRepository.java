package com.proxask.repository.jpa;

import com.proxask.entity.AnswerLike;
import com.proxask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnswerLikeRepository extends JpaRepository<AnswerLike, String> {
    boolean existsByUserAndAnswerId(User user, String answerId);
    Optional<AnswerLike> findByUserAndAnswerId(User user, String answerId);
    long countByAnswerId(String answerId);
    void deleteByUserAndAnswerId(User user, String answerId);
}
