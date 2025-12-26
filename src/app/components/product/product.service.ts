import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, PageResponse } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/product';

  constructor(private http: HttpClient) {}

  getAllProducts(page: number, size: number): Observable<PageResponse<Product>> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());
  return this.http.get<PageResponse<Product>>(`${this.apiUrl}/get-all`, { params });
}

 searchProducts(name: string, page: number, size: number): Observable<PageResponse<Product>> {
  const params = new HttpParams()
    .set('name', name)
    .set('page', page)
    .set('size', size);
  return this.http.get<PageResponse<Product>>(this.apiUrl, { params }); 
}

  registerProduct(barcode: string): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/register`, { barcode });
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/add-name-price`, product);
  }

  decreaseQuantity(barcode: string): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/decrease-quantity?barcode=${encodeURIComponent(barcode)}`, {});
  }

  deleteProduct(barcode: string): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/delete-product?barcode=${encodeURIComponent(barcode)}`);
}

  getProductByBarcode(barcode: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/barcode/${barcode}`);
  }
}