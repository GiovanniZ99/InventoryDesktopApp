package com.storage.warehouse.service;

import com.storage.warehouse.dto.NewProductDTO;
import com.storage.warehouse.dto.ProductDTO;
import org.springframework.data.domain.Page;

public interface ProductService {
    ProductDTO registerOrSellProduct(NewProductDTO newProductDTO);
    Page<ProductDTO> getProduct(String name, int page, int size);
    Page<ProductDTO> getAllProduct(int page, int size);
    ProductDTO addNamePriceStockQuantityProduct(ProductDTO productDTO);
    ProductDTO decreaseQuantity(String barcode);
    ProductDTO deleteProduct(String barcode);
    ProductDTO getProductByBarcode(String barcode);
    void updateExistingProductsCreatedAt();
}
