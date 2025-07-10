package com.lymph.Walmart_Application.entity;

import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a product in the store.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    private String sku;
    private String name;
    private String category; // Added missing category field
    private String waypointId; // Associates product with a waypoint for pathfinding

    @Embedded // Embeds the Location object directly into the Product table/document
    private Location location;

    // The conflicting inner static Location class has been REMOVED.
    // The project now uses the single, standalone Location.java entity.
}