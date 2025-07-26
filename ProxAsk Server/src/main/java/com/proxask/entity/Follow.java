package com.proxask.entity;

import jakarta.persistence.*;

import java.util.UUID;


@Entity
@Table()
public class Follow {
    @Id
    private String id;

    private Follow(){
        this.id = generateId();
    }

    @OneToMany
    @JoinColumn(name = "follower_id")
    private User follower;

    private String generateId(){
        return UUID.randomUUID().toString().replace("-", "");
    }
}
