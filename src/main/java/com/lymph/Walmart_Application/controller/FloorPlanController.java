// FloorPlanController.java
package com.lymph.Walmart_Application.controller;

import com.lymph.Walmart_Application.entity.Settings;
import com.lymph.Walmart_Application.repo.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class FloorPlanController {

    private static final String UPLOAD_DIR = "./uploaded-maps/";

    @Autowired
    private SettingsRepository settingsRepository;

    @PostMapping("/floorplan/upload")
    public ResponseEntity<String> uploadFloorPlan(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }

        try {
            // Generate a unique filename to avoid conflicts
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            Path path = Paths.get(UPLOAD_DIR + uniqueFilename);
            Files.copy(file.getInputStream(), path);

            String fileUrl = "/maps/" + uniqueFilename;

            // Save the new URL to our settings in MongoDB
            Settings settings = settingsRepository.findById("active_config")
                    .orElse(new Settings()); // Create new settings if none exist
            settings.setId("active_config");
            settings.setActiveFloorPlanUrl(fileUrl);
            settingsRepository.save(settings);

            return ResponseEntity.ok().body("File uploaded successfully: " + fileUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload file.");
        }
    }

    @GetMapping("/floorplan/active")
    public ResponseEntity<Settings> getActiveFloorPlan() {
        Settings settings = settingsRepository.findById("active_config")
                .orElse(null);
        if (settings == null) {
            // Return a default if no map has been uploaded yet
            Settings defaultSettings = new Settings();
            defaultSettings.setActiveFloorPlanUrl("/floor-plan.svg"); // The original hardcoded map
            return ResponseEntity.ok(defaultSettings);
        }
        return ResponseEntity.ok(settings);
    }
}