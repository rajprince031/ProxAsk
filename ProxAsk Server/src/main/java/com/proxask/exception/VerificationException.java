package com.proxask.exception;

public class VerificationException extends RuntimeException {
    public VerificationException(String otpExpired) {
        super(otpExpired);
    }
}
