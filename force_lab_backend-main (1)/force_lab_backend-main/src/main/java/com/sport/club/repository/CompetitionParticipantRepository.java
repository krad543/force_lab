package com.sport.club.repository;

import com.sport.club.model.entity.CompetitionParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompetitionParticipantRepository extends JpaRepository<CompetitionParticipant, UUID> {
    List<CompetitionParticipant> findByCompetitionId(UUID competitionId);
    List<CompetitionParticipant> findByAthleteId(UUID athleteId);
    Optional<CompetitionParticipant> findByCompetitionIdAndAthleteId(UUID competitionId, UUID athleteId);
}
