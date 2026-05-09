package com.digitello.screen_service.repository;

import com.digitello.screen_service.entity.Screen;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScreenRepository extends JpaRepository<Screen, Long> {
    List<Screen> findByStatus(Screen.Status status);
    List<Screen> findByCity(String city);
    long countByStatus(Screen.Status status);
}