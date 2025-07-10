package com.lymph.Walmart_Application.controller;

import com.lymph.Walmart_Application.entity.Location;
import com.lymph.Walmart_Application.entity.Settings;
import com.lymph.Walmart_Application.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * Controller to handle API requests related to application settings,
 * such as defining start and end points for routes.
 */
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private RouteService routeService;

    @GetMapping
    public Settings getSettings() {
        return routeService.getSettings();
    }

    @PutMapping("/location/{type}")
    public Settings updateLocationSetting(@PathVariable String type, @RequestBody Location location) {
        return routeService.updateLocationSetting(type, location);
    }
}