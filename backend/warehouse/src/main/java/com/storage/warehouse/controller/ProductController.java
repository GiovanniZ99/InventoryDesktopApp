package com.storage.warehouse.controller;

import com.storage.warehouse.dto.NewProductDTO;
import com.storage.warehouse.dto.ProductDTO;
import com.storage.warehouse.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/product")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/register")
    public ResponseEntity<ProductDTO> registerOrSellProduct(@RequestBody NewProductDTO newProduct) {
        return ResponseEntity.ok(productService.registerOrSellProduct(newProduct));
    }

    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getProduct(@RequestParam String name,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "1") int size) {
        return ResponseEntity.ok(productService.getProduct(name, page, size));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ProductDTO> getProductByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(productService.getProductByBarcode(barcode));
    }

    @GetMapping("/get-all")
    public ResponseEntity<Page<ProductDTO>> getAllProduct(@RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "8") int size) {
        return ResponseEntity.ok(productService.getAllProduct(page, size));
    }

    @PatchMapping("/decrease-quantity")
    public ResponseEntity<ProductDTO> decreaseQuantityProduct(@RequestParam String barcode) {
        return ResponseEntity.ok(productService.decreaseQuantity(barcode));
    }

    @PatchMapping("/add-name-price")
    public ResponseEntity<ProductDTO> addNamePriceProduct(@Valid @RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(productService.addNamePriceStockQuantityProduct(productDTO));
    }

    @DeleteMapping("/delete-product")
    public ResponseEntity<ProductDTO> deleteProduct(@RequestParam String barcode) {
        return ResponseEntity.ok(productService.deleteProduct(barcode));
    }

    @PostMapping("/update-created-at")
    public ResponseEntity<String> updateExistingProductsCreatedAt() {
        productService.updateExistingProductsCreatedAt();
        return ResponseEntity.ok("Prodotti aggiornati con successo");
    }
}

