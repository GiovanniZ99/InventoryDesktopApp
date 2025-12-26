package com.storage.warehouse.exception;


import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class ControllerAdvisor {
    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<String> handleProductException(ProductNotFoundException e){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(SoldQuantityNegativeException.class)
  public ResponseEntity<String> handleSoldQuantityException(SoldQuantityNegativeException e){
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<List<String>> handleValidationErrors(MethodArgumentNotValidException e) {
    List<String> errors = e.getBindingResult()
      .getFieldErrors()
      .stream()
      .map(DefaultMessageSourceResolvable::getDefaultMessage)
      .toList();

    return ResponseEntity.badRequest().body(errors);
  }
}
