package com.lymph.Walmart_Application.controller;

import com.lymph.Walmart_Application.entity.Product;
import com.lymph.Walmart_Application.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/")
public class ProductController {

    @Autowired
    RouteService service;

    @GetMapping("get-products")
    public List<Product> getAllPrducts(){
        return service.getAllProduct();
    }
    @PostMapping("optimize-route")
    public List<Product> OptimizeRoute (@RequestBody List<String> productIds){
        return service.getOptimisedRoute(productIds);
    }
}

