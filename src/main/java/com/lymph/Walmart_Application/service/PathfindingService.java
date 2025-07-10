package com.lymph.Walmart_Application.service;

import com.lymph.Walmart_Application.entity.Location;
import com.lymph.Walmart_Application.entity.Waypoint;
import com.lymph.Walmart_Application.repo.WaypointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Implements the A* pathfinding algorithm to find the shortest path between two waypoints.
 */
@Service
public class PathfindingService {

    @Autowired
    private WaypointRepository waypointRepository;

    private static class PathNode implements Comparable<PathNode> {
        String waypointId;
        double gScore; // Cost from start to the current node
        double fScore; // Estimated cost from start to end (gScore + heuristic)
        PathNode parent;

        PathNode(String waypointId) {
            this.waypointId = waypointId;
            this.gScore = Double.POSITIVE_INFINITY;
            this.fScore = Double.POSITIVE_INFINITY;
        }

        @Override
        public int compareTo(PathNode other) {
            return Double.compare(this.fScore, other.fScore);
        }
    }

    public List<Waypoint> findPath(String startId, String endId) {
        Map<String, Waypoint> allWaypoints = new HashMap<>();
        waypointRepository.findAll().forEach(wp -> allWaypoints.put(wp.getId(), wp));

        if (!allWaypoints.containsKey(startId) || !allWaypoints.containsKey(endId)) {
            return new ArrayList<>(); // Return empty list if start or end doesn't exist
        }

        Map<String, PathNode> allPathNodes = new HashMap<>();
        allWaypoints.keySet().forEach(id -> allPathNodes.put(id, new PathNode(id)));

        PathNode startNode = allPathNodes.get(startId);
        startNode.gScore = 0;
        startNode.fScore = heuristic(allWaypoints.get(startId), allWaypoints.get(endId));

        PriorityQueue<PathNode> openSet = new PriorityQueue<>();
        openSet.add(startNode);

        Set<String> closedSet = new HashSet<>();

        while (!openSet.isEmpty()) {
            PathNode current = openSet.poll();

            if (current.waypointId.equals(endId)) {
                return reconstructPath(current, allPathNodes, allWaypoints);
            }

            closedSet.add(current.waypointId);

            Waypoint currentWaypoint = allWaypoints.get(current.waypointId);
            if (currentWaypoint.getConnections() == null) continue; // Skip if no connections

            for (String neighborId : currentWaypoint.getConnections()) {
                if (closedSet.contains(neighborId) || !allWaypoints.containsKey(neighborId)) continue;

                PathNode neighborNode = allPathNodes.get(neighborId);
                double tentativeGScore = current.gScore + distanceBetween(currentWaypoint, allWaypoints.get(neighborId));

                if (tentativeGScore < neighborNode.gScore) {
                    neighborNode.parent = current;
                    neighborNode.gScore = tentativeGScore;
                    neighborNode.fScore = neighborNode.gScore + heuristic(allWaypoints.get(neighborId), allWaypoints.get(endId));

                    if (!openSet.contains(neighborNode)) {
                        openSet.add(neighborNode);
                    } else {
                        // Refresh priority if path is better
                        openSet.remove(neighborNode);
                        openSet.add(neighborNode);
                    }
                }
            }
        }
        return new ArrayList<>(); // No path found
    }

    // Heuristic is the straight-line distance (Euclidean distance).
    private double heuristic(Waypoint a, Waypoint b) {
        return distanceBetween(a, b);
    }

    // Calculates 2D Euclidean distance. Ignores Z-axis for pathfinding simplicity.
    private double distanceBetween(Waypoint a, Waypoint b) {
        Location locA = a.getLocation();
        Location locB = b.getLocation();
        return Math.sqrt(Math.pow(locA.getX() - locB.getX(), 2) + Math.pow(locA.getY() - locB.getY(), 2));
    }

    private List<Waypoint> reconstructPath(PathNode current, Map<String, PathNode> allPathNodes, Map<String, Waypoint> allWaypoints) {
        List<Waypoint> totalPath = new ArrayList<>();
        while (current != null) {
            totalPath.add(allWaypoints.get(current.waypointId));
            current = current.parent;
        }
        Collections.reverse(totalPath);
        return totalPath;
    }
}