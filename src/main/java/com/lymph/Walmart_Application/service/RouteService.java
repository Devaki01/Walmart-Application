package com.lymph.Walmart_Application.service;

import com.lymph.Walmart_Application.entity.Product;
import com.lymph.Walmart_Application.repo.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class RouteService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PathfindingService pathfindingService; // Inject our new service

    /**
     * THIS IS THE NEW CORE METHOD.
     * It determines the optimal ORDER of products to visit based on walkable path distance,
     * then returns a single, continuous, point-by-point path for the entire journey.
     *
     * @param productIds The list of product SKUs to find.
     * @return A detailed list of Location objects representing the full path.
     */
    public List<Product.Location> getOptimisedPath(List<String> productIds) {
        List<Product> productsToVisit = productRepository.findBySkuIn(productIds);
        if (productsToVisit.isEmpty()) {
            return new ArrayList<>();
        }

        // Use more realistic coordinates for entrance and checkout based on our map
        Product storeEntrance = new Product("start", "Store Entrance", 300, 750);
        Product checkout = new Product("end", "Checkout", 600, 680);

        List<Product> fullStopList = new ArrayList<>();
        Set<Product> unvisited = new HashSet<>(productsToVisit);
        Product currentStop = storeEntrance;

        fullStopList.add(currentStop);

        // This loop determines the best ORDER of items using the Nearest Neighbor algorithm,
        // but the "distance" is now the realistic path length from our PathfindingService.
        while (!unvisited.isEmpty()) {
            Product nearest = null;
            double minDistance = Double.MAX_VALUE;

            for (Product candidate : unvisited) {
                // IMPORTANT: The "distance" is the length of the path returned by the pathfinder
                int pathLength = pathfindingService.findPath(currentStop.getLocation(), candidate.getLocation()).size();

                if (pathLength < minDistance) {
                    minDistance = pathLength;
                    nearest = candidate;
                }
            }
            fullStopList.add(nearest);
            unvisited.remove(nearest);
            currentStop = nearest;
        }

        fullStopList.add(checkout);

        List<Product.Location> finalPath = new ArrayList<>();
        for (int i = 0; i < fullStopList.size() - 1; i++) {
            Product start = fullStopList.get(i);
            Product end = fullStopList.get(i + 1);

            List<Product.Location> legPath = pathfindingService.findPath(start.getLocation(), end.getLocation());

            // --- ADD THIS CHECK ---
            // If a path was actually found for this leg of the journey...
            if (legPath != null && !legPath.isEmpty()) {

                // Add all points from the leg's path to our final master path
                // (We skip the first point of subsequent legs to avoid duplicate points where paths connect)
                if (i > 0) {
                    finalPath.addAll(legPath.subList(1, legPath.size()));
                } else {
                    finalPath.addAll(legPath);
                }
            } else {
                // Optional: Log a warning if a path between two points couldn't be found
                System.out.println("WARNING: No path found between " + start.getName() + " and " + end.getName());
            }
        }

        return finalPath;}

    // --- METHODS FOR ADMIN PANEL (PRESERVED) ---

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(String sku, Product productDetails) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));

        product.setName(productDetails.getName());
        product.setCategory(productDetails.getCategory());
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(String sku) {
        productRepository.deleteBySku(sku);
    }

    public Product updateProductLocation(String sku, Product.Location newLocation) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));

        product.setLocation(newLocation);
        return productRepository.save(product);
    }

    // --- OLD METHODS (REMOVED) ---
    // The old getOptimisedRoute, findNearest, and distance methods have been removed
    // as their logic is now replaced by getOptimisedPath and the PathfindingService.
}