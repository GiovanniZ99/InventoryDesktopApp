package com.storage.warehouse.repository;

import com.storage.warehouse.document.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    Page<Product> searchByApproximateName(String name, Pageable pageable);
}