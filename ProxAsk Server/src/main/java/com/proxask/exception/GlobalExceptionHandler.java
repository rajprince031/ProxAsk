package com.proxask.exception;


import com.proxask.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.nio.file.AccessDeniedException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex){
        return ResponseEntity
                .status(404)
                .body(new ErrorResponse(ex.getMessage(),404));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex){
        return ResponseEntity.status(403).body(new ErrorResponse(ex.getMessage(), 403));
    }

    @ExceptionHandler(InternalServerError.class)
    public ResponseEntity<ErrorResponse> handleInternalServerError(InternalServerError ex){
        return ResponseEntity.status(500).body(new ErrorResponse(ex.getMessage(), 500));
    }

    @ExceptionHandler(AlreadyFollowingException.class)
    public ResponseEntity<ErrorResponse> handleAlreadyFollowingException(AlreadyFollowingException ex){
        return ResponseEntity.status(409).body(new ErrorResponse(ex.getMessage(), 409));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex){
        return ResponseEntity.status(400).body(new ErrorResponse(ex.getMessage(),400));
    }

    @ExceptionHandler(NotFollowingException.class)
    public ResponseEntity<ErrorResponse> handleNotFollowingException(NotFollowingException ex){
        return ResponseEntity.status(400).body(new ErrorResponse(ex.getMessage(), 400));
    }

    @ExceptionHandler(FollowNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleFollowNotFoundException(FollowNotFoundException ex){
        return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage(), 404));
    }
}

