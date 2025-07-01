package com.lymph.Walmart_Application.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "products")
public class Product {

    @Id
    private String mongoId; // This field correctly maps to MongoDB's `_id`

    @Field("id") // Maps the 'sku' field in Java to the 'id' field in your MongoDB document
    private String sku;

    private String name;
    private String category;
    private Location location;

    // --- Nested class for location data (This part was already correct) ---
    public static class Location {
        private double x;
        private double y;

        public Location(double x, double y) {
            this.x = x;
            this.y = y;
        }

        public double getX() { return x; }
        public void setX(double x) { this.x = x; }
        public double getY() { return y; }
        public void setY(double y) { this.y = y; }
    }


    // --- Constructors (Corrected) ---

    // Default constructor (necessary for Spring Data)
    public Product() {}

    // Main constructor for products from the database
    public Product(String sku, String name, String category, Location location) {
        this.sku = sku; // CORRECTED: was 'this.id = id'
        this.name = name;
        this.category = category;
        this.location = location;
    }

    // Special constructor for non-db points like "entrance" and "checkout"
    public Product(String sku, String name, double x, double y) {
        this.sku = sku; // CORRECTED: was 'this.id = id'
        this.name = name;
        this.location = new Location(x, y);
    }


    // --- Getters and Setters (Corrected and Completed) ---

    public String getMongoId() {
        return mongoId;
    }

    public void setMongoId(String mongoId) {
        this.mongoId = mongoId;
    }

    public String getSku() {
        return sku; // CORRECTED: Replaced getId()
    }

    public void setSku(String sku) {
        this.sku = sku; // CORRECTED: Replaced setId()
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }
}