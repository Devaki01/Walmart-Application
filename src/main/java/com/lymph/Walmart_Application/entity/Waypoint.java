package com.lymph.Walmart_Application.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList; // Import ArrayList
import java.util.List;
import lombok.Data;

/**
 * Represents a node in the store's pathfinding graph.
 * Stored in a MongoDB collection named "waypoints".
 */
@Document(collection = "waypoints")
@Data
public class Waypoint {
    @Id
    private String id;
    private Location location;
    // Initialize the list to prevent NullPointerExceptions when adding connections.
    private List<String> connections = new ArrayList<>();

}
