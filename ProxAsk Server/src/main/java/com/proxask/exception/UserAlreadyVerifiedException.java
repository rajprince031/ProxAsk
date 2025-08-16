package com.proxask.exception;

public class UserAlreadyVerifiedException extends RuntimeException{
    public UserAlreadyVerifiedException(String message) {
        super(message);
    }
}
