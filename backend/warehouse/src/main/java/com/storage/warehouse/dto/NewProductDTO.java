package com.storage.warehouse.dto;


public class NewProductDTO {

  private String barcode;

  public NewProductDTO(String barcode) {
    this.barcode = barcode;
  }

  public NewProductDTO() {
  }

  public String getBarcode() {
    return barcode;
  }

  public void setBarcode(String barcode) {
    this.barcode = barcode;
  }
}

