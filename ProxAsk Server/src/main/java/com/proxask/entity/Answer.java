package com.proxask.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.proxask.enums.Visibility;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "answers")
@ToString(exclude = {"question", "likes"})
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 5000)
    private String content;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Visibility visibility = Visibility.PUBLIC;

    @OneToOne(fetch = FetchType.LAZY)
    @JsonBackReference
    private Question question;

    @OneToMany(mappedBy = "answer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnswerLike> likes = new ArrayList<>();
}
