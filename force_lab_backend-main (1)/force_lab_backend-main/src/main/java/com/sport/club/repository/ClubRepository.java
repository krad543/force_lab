package com.sport.club.repository;

import com.sport.club.model.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClubRepository extends JpaRepository<Club, UUID> {
    List<Club> findByCoachId(UUID coachId);
    List<Club> findBySportType(String sportType);
}
