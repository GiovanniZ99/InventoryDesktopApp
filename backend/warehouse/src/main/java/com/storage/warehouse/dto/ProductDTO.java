package com.storage.warehouse.dto;

import jakarta.validation.constraints.Min;

import java.time.LocalDate;

public class ProductDTO {

  private String barcode;

  private String name;

  @Min(value = 0, message = "Il prezzo non può essere negativo")
  private double price;

  @Min(value = 0, message = "La quantità in magazzino non può essere negativa")
  private int stockQuantity;

  @Min(value = 0, message = "La quantità venduta non può essere negativa")
  private int soldQuantity;

  private LocalDate createdAt;

  public ProductDTO(String barcode, String name, double price, int soldQuantity) {
    this.barcode = barcode;
    this.name = name;
    this.price = price;
    this.soldQuantity = soldQuantity;
  }

  public ProductDTO() {
  }

  public String getBarcode() {
    return barcode;
  }

  public void setBarcode(String barcode) {
    this.barcode = barcode;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public double getPrice() {
    return price;
  }

  public void setPrice(double price) {
    this.price = price;
  }

  public int getStockQuantity() {
    return stockQuantity;
  }

  public void setStockQuantity(int stockQuantity) {
    this.stockQuantity = stockQuantity;
  }

  public int getSoldQuantity() {
    return soldQuantity;
  }

  public void setSoldQuantity(int soldQuantity) {
    this.soldQuantity = soldQuantity;
  }

  public LocalDate getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDate createdAt) {
    this.createdAt = createdAt;
  }
}

