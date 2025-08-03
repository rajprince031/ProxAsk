package com.proxask.exception;

public class QuestionAlreadyAnsweredException extends RuntimeException {
    public QuestionAlreadyAnsweredException(String message) {
        super(message);
    }
}