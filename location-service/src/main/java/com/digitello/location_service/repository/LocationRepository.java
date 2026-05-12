package com.digitello.location_service.repository;

import com.digitello.location_service.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByScreenId(Long screenId);
    List<Location> findByCity(String city);
    List<Location> findByCityContainingIgnoreCase(String city);

    @Query("SELECT l FROM Location l WHERE " +
           "ABS(l.latitude - :lat) < :radius AND " +
           "ABS(l.longitude - :lng) < :radius")
    List<Location> findNearby(@Param("lat") Double lat,
                               @Param("lng") Double lng,
                               @Param("radius") Double radius);
}