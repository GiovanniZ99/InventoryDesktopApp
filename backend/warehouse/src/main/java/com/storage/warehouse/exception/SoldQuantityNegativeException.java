package com.storage.warehouse.exception;

public class SoldQuantityNegativeException extends IllegalArgumentException {
  public SoldQuantityNegativeException(String message) {
    super(message);
  }
}
