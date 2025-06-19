package com.lymph.Walmart_Application.service;

import com.lymph.Walmart_Application.entity.Product;
import com.lymph.Walmart_Application.repo.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RouteService {

    @Autowired
    ProductRepository productRepository;

    public List<Product> getOptimisedRoute(List<String> productIds) {
        List<Product> products = productRepository.findByIdIn(productIds);
        if (products.isEmpty()) return new ArrayList<>();

        List<Product> route = new ArrayList<>();
        Set<Product> unvisited = new HashSet<>(products);

        Product current = products.get(0); // start from first selected product
        route.add(current);
        unvisited.remove(current);

        while (!unvisited.isEmpty()) {
            Product nearest = null;
            double minDistance = Double.MAX_VALUE;

            for (Product candidate : unvisited) {
                double dist = distance(current, candidate);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearest = candidate;
                }
            }

            route.add(nearest);
            unvisited.remove(nearest);
            current = nearest;
        }

        return route;
    }

    private double distance(Product a, Product b) {
        double dx = a.getxCoordinate() - b.getxCoordinate();
        double dy = a.getyCoordinate() - b.getyCoordinate();
        return Math.sqrt(dx * dx + dy * dy);
    }

    public List<Product> getAllProduct() {
        return productRepository.findAll();
    }
}
