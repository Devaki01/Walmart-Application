// WebConfig.java (Improved Version)
package com.lymph.Walmart_Application; // Use your correct package name

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // This line programmatically finds the absolute path to your upload directory
        String uploadPath = Paths.get("uploaded-maps").toAbsolutePath().toString();

        // We add "file:///" to tell Spring it's a local file system path
        registry.addResourceHandler("/maps/**")
                .addResourceLocations("file:///" + uploadPath + "/");
    }
}