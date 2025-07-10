// src/main/java/com/lymph/Walmart_Application/repo/SettingsRepository.java
package com.lymph.Walmart_Application.repo;

import com.lymph.Walmart_Application.entity.Settings;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SettingsRepository extends MongoRepository<Settings, String> {}