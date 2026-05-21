package com.sport.club.repository;

import com.sport.club.model.entity.Competition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CompetitionRepository extends JpaRepository<Competition, UUID> {
    List<Competition> findByCoachId(UUID coachId);
    List<Competition> findBySportType(String sportType);
}
