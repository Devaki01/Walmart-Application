package com.lymph.Walmart_Application.service;

import com.lymph.Walmart_Application.entity.Product;
import com.lymph.Walmart_Application.repo.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteService {

    @Autowired
    ProductRepository productRepository;

    public List<Product> getOptimisedRoute(List<String> productIds){
        List<Product> productList = productRepository.findByIdIn(productIds);
        //ImplementTSP
        return productList;
    }

   public  List<Product> getAllProduct(){
        //we can call this method directly in our controller
        //just inject product repository in controller
        //not a good practice
        return productRepository.findAll();
    }
}
