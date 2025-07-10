package com.lymph.Walmart_Application.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

/**
 * Represents store-wide settings, like entrance and checkout locations.
 * Stored in a MongoDB collection named "settings".
 */
@Document(collection = "settings")
@Data // Using Lombok to reduce boilerplate
public class Settings {

    @Id
    private String id; // A fixed ID, e.g., "store_config"

    private Location entranceLocation;
    private Location checkoutLocation;
}