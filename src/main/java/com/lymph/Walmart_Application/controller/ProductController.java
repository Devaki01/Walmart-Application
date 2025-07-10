package com.lymph.Walmart_Application.controller;

import com.lymph.Walmart_Application.entity.Location;
import com.lymph.Walmart_Application.entity.Product;
import com.lymph.Walmart_Application.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller to handle API requests related to Products.
 * This includes CRUD operations and route optimization.
 */
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private RouteService routeService;

    @GetMapping
    public List<Product> getAllProducts(){
        return routeService.getAllProducts();
    }

    @PostMapping("/optimize-route")
    public List<Location> optimizeRoute (@RequestBody List<String> productIds){
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
    public Product updateProductLocation(@PathVariable String sku, @RequestBody Location newLocation) {
        return routeService.updateProductLocation(sku, newLocation);
    }

    @PutMapping("/{sku}/assign-waypoint")
    public Product assignProductToWaypoint(@PathVariable String sku, @RequestBody Map<String, String> payload) {
        String waypointId = payload.get("waypointId");
        return routeService.assignProductToWaypoint(sku, waypointId);
    }
}
