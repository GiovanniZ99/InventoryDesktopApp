package com.storage.warehouse.service;

import com.storage.warehouse.document.Product;
import com.storage.warehouse.dto.NewProductDTO;
import com.storage.warehouse.dto.ProductDTO;
import com.storage.warehouse.exception.ProductNotFoundException;
import com.storage.warehouse.exception.SoldQuantityNegativeException;
import com.storage.warehouse.mapper.ProductMapper;
import com.storage.warehouse.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

  private final ProductRepository productRepository;

  private final ProductMapper productMapper;

  public ProductServiceImpl(ProductRepository productRepository, ProductMapper productMapper) {
    this.productRepository = productRepository;
    this.productMapper = productMapper;
  }

  @Override
  public ProductDTO registerOrSellProduct(NewProductDTO newProductDTO) {
    Product product = productRepository.findById(newProductDTO.getBarcode())
      .map(existingProduct -> {
        existingProduct.setSoldQuantity(existingProduct.getSoldQuantity() + 1);
        return productRepository.save(existingProduct);
      }).orElseGet(() -> {
        Product newProduct = productMapper.newProductToEntity(newProductDTO);
        newProduct.setCreatedAt(LocalDateTime.now());
        return productRepository.save(newProduct);
      });

    return productMapper.productToDTO(product);
  }

  @Override
  public Page<ProductDTO> getProduct(String name, int page, int size) {
    PageRequest pageRequest = PageRequest.of(page, size);
    Page<Product> products = productRepository.searchByApproximateName(name, pageRequest);

    if (products.isEmpty()) {
      throw new ProductNotFoundException("Prodotto non trovato");
    }

    return products.map(productMapper::productToDTO);
  }

  @Override
  public Page<ProductDTO> getAllProduct(int page, int size) {
    PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<Product> products = productRepository.findAll(pageRequest);

    return products.map(productMapper::productToDTO);
  }

  @Override
  public ProductDTO addNamePriceStockQuantityProduct(ProductDTO productDTO) {
    Product product = productRepository.findById(productDTO.getBarcode())
      .orElseThrow(() -> new ProductNotFoundException("Prodotto non trovato"));

    product.setName(productDTO.getName());
    product.setPrice(productDTO.getPrice());
    product.setStockQuantity(productDTO.getStockQuantity());
    productRepository.save(product);

    return productMapper.productToDTO(product);
  }

  @Override
  public ProductDTO decreaseQuantity(String barcode) {
    Product product = this.getProductEntity(barcode);

    if (product.getSoldQuantity() == 0) {
      throw new SoldQuantityNegativeException("La quantità venduta non può essere negativa");
    }
    product.setSoldQuantity(product.getSoldQuantity() - 1);

    productRepository.save(product);

    return productMapper.productToDTO(product);
  }

  @Override
  public ProductDTO deleteProduct(String barcode) {
    Product product = this.getProductEntity(barcode);
    productRepository.deleteById(product.getBarcode());

    return productMapper.productToDTO(product);
  }

  private Product getProductEntity(String barcode) {
    return productRepository.findById(barcode)
      .orElseThrow(() -> new ProductNotFoundException("Prodotto non trovato"));
  }

  @Override
  public ProductDTO getProductByBarcode(String barcode) {
    return productMapper.productToDTO(this.getProductEntity(barcode));
  }

  @Override
  public void updateExistingProductsCreatedAt() {
    List<Product> products = productRepository.findAll();
    LocalDateTime now = LocalDateTime.now();

    for (Product product : products) {
      if (product.getCreatedAt() == null) {
        product.setCreatedAt(now);
        productRepository.save(product);
      }
    }
  }
}

