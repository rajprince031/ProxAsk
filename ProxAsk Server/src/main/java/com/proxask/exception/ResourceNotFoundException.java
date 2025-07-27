package com.proxask.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String receiverNotFound) {
        super(receiverNotFound);
    }
}
