package com.proxask.repository;


import com.proxask.entity.Answer;
import com.proxask.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, String> {
    Optional<Answer> findByQuestion(Question question);
}
