package com.lymph.Walmart_Application.controller;

import com.lymph.Walmart_Application.entity.Location;
import com.lymph.Walmart_Application.entity.Waypoint;
import com.lymph.Walmart_Application.service.WaypointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for creating, retrieving, updating, deleting, and connecting Waypoint data.
 */
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/waypoints")
public class WaypointController {

    @Autowired
    private WaypointService waypointService;

    @GetMapping
    public List<Waypoint> getAllWaypoints() {
        return waypointService.getAllWaypoints();
    }

    @PostMapping
    public Waypoint createWaypoint(@RequestBody Waypoint waypoint) {
        return waypointService.createWaypoint(waypoint);
    }

    @PostMapping("/{id}/connect")
    public ResponseEntity<?> addConnection(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String connectToId = payload.get("connectToId");
        if (connectToId == null || connectToId.isEmpty()) {
            return ResponseEntity.badRequest().body("connectToId is required.");
        }
        waypointService.addConnection(id, connectToId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/location")
    public Waypoint updateWaypointLocation(@PathVariable String id, @RequestBody Location newLocation) {
        return waypointService.updateWaypointLocation(id, newLocation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWaypoint(@PathVariable String id) {
        waypointService.deleteWaypoint(id);
        return ResponseEntity.ok().build();
    }
}