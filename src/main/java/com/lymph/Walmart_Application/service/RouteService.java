package com.lymph.Walmart_Application.service;

import com.lymph.Walmart_Application.entity.Location;
import com.lymph.Walmart_Application.entity.Product;
import com.lymph.Walmart_Application.entity.Settings;
import com.lymph.Walmart_Application.entity.Waypoint;
import com.lymph.Walmart_Application.repo.ProductRepository;
import com.lymph.Walmart_Application.repo.SettingsRepository;
import com.lymph.Walmart_Application.repo.WaypointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RouteService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private WaypointRepository waypointRepository;
    @Autowired
    private PathfindingService pathfindingService;
    @Autowired
    private SettingsRepository settingsRepository;

    public List<Location> getOptimisedPath(List<String> productIds) {
        List<Product> productsToVisit = productRepository.findBySkuIn(productIds);
        if (productsToVisit.isEmpty()) return new ArrayList<>();

        Map<String, Waypoint> waypointMap = waypointRepository.findAll().stream()
                .filter(wp -> wp != null && wp.getLocation() != null)
                .collect(Collectors.toMap(Waypoint::getId, wp -> wp));

        List<String> waypointIdsToVisit = productsToVisit.stream()
                .map(Product::getWaypointId)
                .filter(id -> id != null && !id.isEmpty() && waypointMap.containsKey(id))
                .distinct()
                .collect(Collectors.toList());

        if (waypointIdsToVisit.isEmpty()) {
            System.err.println("Routing failed: Products are not assigned to valid waypoints.");
            return new ArrayList<>();
        }

        Settings settings = getSettings();
        String entranceWaypointId = getNearestWaypointId(settings.getEntranceLocation());
        String checkoutWaypointId = getNearestWaypointId(settings.getCheckoutLocation());

        List<String> orderedWaypointIds = new ArrayList<>();
        String currentWaypointId = entranceWaypointId;

        if (currentWaypointId == null || !waypointMap.containsKey(currentWaypointId)) {
            if (waypointIdsToVisit.isEmpty()) return new ArrayList<>();
            currentWaypointId = waypointIdsToVisit.remove(0);
        }
        orderedWaypointIds.add(currentWaypointId);

        while (!waypointIdsToVisit.isEmpty()) {
            String finalCurrentWaypointId = currentWaypointId;
            String nearestWaypointId = waypointIdsToVisit.stream()
                    .min(Comparator.comparingDouble(candidateId -> {
                        List<Waypoint> path = pathfindingService.findPath(finalCurrentWaypointId, candidateId);
                        return path.isEmpty() ? Double.MAX_VALUE : path.size();
                    }))
                    .orElse(null);

            if (nearestWaypointId == null) {
                System.err.println("Could not find a path to remaining waypoints. The graph may be disconnected.");
                break;
            }

            orderedWaypointIds.add(nearestWaypointId);
            waypointIdsToVisit.remove(nearestWaypointId);
            currentWaypointId = nearestWaypointId;
        }

        if (checkoutWaypointId != null && waypointMap.containsKey(checkoutWaypointId) && !orderedWaypointIds.get(orderedWaypointIds.size()-1).equals(checkoutWaypointId)) {
            orderedWaypointIds.add(checkoutWaypointId);
        }

        List<Location> finalPath = new ArrayList<>();
        for (int i = 0; i < orderedWaypointIds.size() - 1; i++) {
            List<Waypoint> legPathWaypoints = pathfindingService.findPath(orderedWaypointIds.get(i), orderedWaypointIds.get(i + 1));
            if (legPathWaypoints != null && !legPathWaypoints.isEmpty()) {
                List<Location> legPathLocations = legPathWaypoints.stream()
                        .map(Waypoint::getLocation)
                        .collect(Collectors.toList());
                if (i > 0 && !finalPath.isEmpty() && !legPathLocations.isEmpty()) {
                    finalPath.addAll(legPathLocations.subList(1, legPathLocations.size()));
                } else {
                    finalPath.addAll(legPathLocations);
                }
            }
        }
        return finalPath;
    }

    private String getNearestWaypointId(Location point) {
        if (point == null) return null;
        return waypointRepository.findAll().stream()
                .filter(wp -> wp.getLocation() != null)
                .min(Comparator.comparingDouble(wp -> distanceBetween(point, wp.getLocation())))
                .map(Waypoint::getId)
                .orElse(null);
    }

    private double distanceBetween(Location a, Location b) {
        if (a == null || b == null) return Double.MAX_VALUE;
        return Math.sqrt(Math.pow(a.getX() - b.getX(), 2) + Math.pow(a.getY() - b.getY(), 2));
    }

    public List<Product> getAllProducts() { return productRepository.findAll(); }
    public Product createProduct(Product product) { return productRepository.save(product); }
    public Product updateProduct(String sku, Product productDetails) {
        Product product = productRepository.findBySku(sku).orElseThrow(() -> new RuntimeException("Product not found: " + sku));
        product.setName(productDetails.getName());
        if (productDetails.getCategory() != null) product.setCategory(productDetails.getCategory());
        product.setWaypointId(productDetails.getWaypointId());
        product.setLocation(productDetails.getLocation());
        return productRepository.save(product);
    }
    @Transactional
    public void deleteProduct(String sku) { productRepository.deleteBySku(sku); }

    /**
     * This method was missing, causing the "cannot find symbol" error.
     * It updates a product's raw location and assigns it to the nearest waypoint.
     * @param sku The SKU of the product to update.
     * @param newLocation The new location for the product.
     * @return The updated product.
     */
    @Transactional
    public Product updateProductLocation(String sku, Location newLocation) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));
        product.setLocation(newLocation);
        product.setWaypointId(getNearestWaypointId(newLocation));
        return productRepository.save(product);
    }

    public Product assignProductToWaypoint(String sku, String waypointId) {
        Product product = productRepository.findBySku(sku).orElseThrow(() -> new RuntimeException("Product not found: " + sku));
        waypointRepository.findById(waypointId).orElseThrow(() -> new RuntimeException("Waypoint not found: " + waypointId));
        product.setWaypointId(waypointId);
        return productRepository.save(product);
    }
    public Settings getSettings() {
        return settingsRepository.findById("store_config").orElseGet(() -> {
            Settings defaultSettings = new Settings();
            defaultSettings.setId("store_config");
            defaultSettings.setEntranceLocation(new Location(300, 750, 0));
            defaultSettings.setCheckoutLocation(new Location(600, 680, 0));
            return settingsRepository.save(defaultSettings);
        });
    }
    public Settings updateLocationSetting(String type, Location location) {
        Settings settings = getSettings();
        if ("entrance".equalsIgnoreCase(type)) settings.setEntranceLocation(location);
        else if ("checkout".equalsIgnoreCase(type)) settings.setCheckoutLocation(location);
        else throw new IllegalArgumentException("Invalid location type: " + type);
        return settingsRepository.save(settings);
    }
}
