import { Injectable } from '@angular/core';
import { Product, PageResponse } from '../../models/product.model';

declare global {
  interface Window {
    electronAPI: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  registerOrSellProduct(barcode: string): Promise<Product> {
    return window.electronAPI.registerOrSellProduct(barcode);
  }
  getAllProducts(page: number, size: number): Promise<PageResponse<Product>> {
    return window.electronAPI.getAllProducts(page, size);
  }
  
  getProductByBarcode(barcode: string): Promise<Product> {
    return window.electronAPI.getProductByBarcode(barcode);
  }

  getProductByName(name: string, page: number, size: number): Promise<PageResponse<Product>> {
    return window.electronAPI.getProductByName(name, page, size);
  }

  updateProduct(product: Product): Promise<Product> {
    return window.electronAPI.updateProduct(product);
  }

  decreaseQuantity(barcode: string): Promise<Product> {
    return window.electronAPI.decreaseQuantity(barcode);
  }

  deleteProduct(barcode: string): Promise<void> {
    return window.electronAPI.deleteProduct(barcode);
  }
}
