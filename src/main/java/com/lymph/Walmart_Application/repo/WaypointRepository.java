// src/main/java/com/lymph/Walmart_Application/repo/WaypointRepository.java
package com.lymph.Walmart_Application.repo;

import com.lymph.Walmart_Application.entity.Waypoint;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WaypointRepository extends MongoRepository<Waypoint, String> {
}