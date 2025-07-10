package com.lymph.Walmart_Application.repo;

import com.lymph.Walmart_Application.entity.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {
    Optional<Product> findBySku(String sku);
    List<Product> findBySkuIn(List<String> skus);
    void deleteBySku(String sku);
}