package com.lymph.Walmart_Application.repo;

import com.lymph.Walmart_Application.entity.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    @Query("{ 'id' : { $in: ?0 } }")
    List<Product> findBySkuIn(List<String> skus);

    void deleteBySku(String sku);

    Optional<Product> findBySku(String sku);
}
