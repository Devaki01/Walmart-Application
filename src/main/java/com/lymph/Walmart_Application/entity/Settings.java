// Settings.java
package com.lymph.Walmart_Application.entity;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "settings")
public class Settings {
    @Id
    private String id; // e.g., "active_config"
    private String activeFloorPlanUrl;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getActiveFloorPlanUrl() { return activeFloorPlanUrl; }
    public void setActiveFloorPlanUrl(String activeFloorPlanUrl) { this.activeFloorPlanUrl = activeFloorPlanUrl; }
}