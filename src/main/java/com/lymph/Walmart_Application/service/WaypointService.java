package com.lymph.Walmart_Application.service;

import com.lymph.Walmart_Application.entity.Location;
import com.lymph.Walmart_Application.entity.Waypoint;
import com.lymph.Walmart_Application.repo.WaypointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WaypointService {

    @Autowired
    private WaypointRepository waypointRepository;

    public List<Waypoint> getAllWaypoints() {
        return waypointRepository.findAll();
    }

    public Waypoint createWaypoint(Waypoint waypoint) {
        return waypointRepository.save(waypoint);
    }

    @Transactional
    public void addConnection(String waypointId1, String waypointId2) {
        if (waypointId1.equals(waypointId2)) return; // Cannot connect a waypoint to itself

        Waypoint wp1 = waypointRepository.findById(waypointId1)
                .orElseThrow(() -> new RuntimeException("Waypoint not found: " + waypointId1));
        Waypoint wp2 = waypointRepository.findById(waypointId2)
                .orElseThrow(() -> new RuntimeException("Waypoint not found: " + waypointId2));

        wp1.getConnections().add(waypointId2);
        wp2.getConnections().add(waypointId1);

        waypointRepository.save(wp1);
        waypointRepository.save(wp2);
    }

    @Transactional
    public Waypoint updateWaypointLocation(String id, Location newLocation) {
        Waypoint waypoint = waypointRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Waypoint not found: " + id));
        waypoint.setLocation(newLocation);
        return waypointRepository.save(waypoint);
    }

    @Transactional
    public void deleteWaypoint(String id) {
        // First, remove this waypoint's ID from any other waypoint's connection list
        List<Waypoint> allWaypoints = waypointRepository.findAll();
        for (Waypoint wp : allWaypoints) {
            if (wp.getConnections().contains(id)) {
                wp.getConnections().remove(id);
                waypointRepository.save(wp);
            }
        }
        // Then, delete the waypoint itself
        waypointRepository.deleteById(id);
    }
}
