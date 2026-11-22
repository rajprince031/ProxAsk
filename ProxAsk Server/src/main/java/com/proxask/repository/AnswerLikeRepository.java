package com.proxask.repository;

import com.proxask.entity.Answer;
import com.proxask.entity.AnswerLike;
import com.proxask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnswerLikeRepository extends JpaRepository<AnswerLike, String> {
    boolean existsByUserAndAnswer(User user, Answer answer);
    Optional<AnswerLike> findByUserAndAnswer(User user, Answer answer);
    long countByAnswer(Answer answer);
    void deleteByUserAndAnswer(User user, Answer answer);
}
