package com.storage.warehouse.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "products")
public class Product {
  @Id
  private String barcode;

  private String name;

  private double price;

  private int stockQuantity;

  private int soldQuantity = 0;

  private LocalDateTime createdAt;

  public Product(String barcode, String name, double price, int soldQuantity) {
    this.barcode = barcode;
    this.name = name;
    this.price = price;
    this.soldQuantity = soldQuantity;
    this.createdAt = LocalDateTime.now();
  }

  public Product() {
  }

  public String getBarcode() {
    return barcode;
  }

  public void setBarcode(String barcode) {
    this.barcode = barcode;
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

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }
}


