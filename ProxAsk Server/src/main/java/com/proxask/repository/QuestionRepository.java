package com.proxask.repository;

import com.proxask.entity.Question;
import com.proxask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, String> {
    List<Question> findByReceiver(User receiver);

}
