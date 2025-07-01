package com.lymph.Walmart_Application.controller;
import com.lymph.Walmart_Application.entity.Product;
import com.lymph.Walmart_Application.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/products") // Removed trailing slash (common practice)
public class ProductController {

    @Autowired
    private RouteService routeService; // Renamed for convention

    @GetMapping
    public List<Product> getAllProducts(){ // Renamed for convention
        return routeService.getAllProducts();
    }

    @PostMapping("/optimize-route")
    // Change the return type here to List<Product.Location>
    public List<Product.Location> optimizeRoute(@RequestBody List<String> productIds) {
        // Call the new service method
        return routeService.getOptimisedPath(productIds);
    }
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return routeService.createProduct(product);
    }

    @PutMapping("/{sku}")
    public Product updateProduct(@PathVariable String sku, @RequestBody Product productDetails) {
        return routeService.updateProduct(sku, productDetails);
    }

    @DeleteMapping("/{sku}")
    public ResponseEntity<?> deleteProduct(@PathVariable String sku) {
        routeService.deleteProduct(sku);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{sku}/location")
    public Product updateProductLocation(@PathVariable String sku, @RequestBody Product.Location newLocation) {
        return routeService.updateProductLocation(sku, newLocation);
    }
}