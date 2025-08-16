package com.proxask.exception;

public class UsernameAlreadyInUseException extends RuntimeException {
    public UsernameAlreadyInUseException(String usernameAlreadyInUse) {
        super(usernameAlreadyInUse);
    }
}
