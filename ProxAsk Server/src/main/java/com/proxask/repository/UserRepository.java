package com.proxask.repository;

import com.proxask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByEmailAndIsVerifiedTrue(String email);

    boolean existsByUsernameAndIsVerifiedTrue(String username);
    
    boolean existsByEmailAndIsVerifiedFalse(String email);

    @Transactional
    @Modifying
    void deleteByEmailAndIsVerifiedFalse(String email);

    @Transactional
    @Modifying
    void deleteByUsernameAndIsVerifiedFalse(String username);

}
