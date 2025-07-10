package com.lymph.Walmart_Application.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a 3D coordinate.
 * This is now a standalone, embeddable class to be used by other entities.
 * Using Lombok for boilerplate code (getters, setters, constructors).
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {
    private double x;
    private double y;
    private double z; // Added z for consistency, even if not used in all calculations
}