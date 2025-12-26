export interface Product {
    barcode: string;
    name?: string;
    price?: number;
    stockQuantity?: number;
    soldQuantity: number;
  }
  
  export interface NewProduct {
    barcode: string;
  }
export interface PaginationDetails {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  page: PaginationDetails;
}