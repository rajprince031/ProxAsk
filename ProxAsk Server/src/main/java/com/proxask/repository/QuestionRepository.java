package com.proxask.repository;

import com.proxask.entity.Question;
import com.proxask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, String> {
    List<Question> findByReceiver(User receiver);
    List<Question> findByReceiverOrderByCreatedAtDesc(User receiver);
    List<Question> findAllByOrderByCreatedAtDesc();
}
