package com.sport.club.repository;

import com.sport.club.model.TrainingFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<TrainingFeedback, UUID> {

    Optional<TrainingFeedback> findByAttendanceId(UUID attendanceId);

    List<TrainingFeedback> findByTrainingId(UUID trainingId);

    // Все фидбеки спортсменов тренера — через таблицу тренировок
    @Query("""
        SELECT f FROM TrainingFeedback f
        WHERE f.trainingId IN (
            SELECT t.id FROM Training t WHERE t.coachId = :coachId
        )
        ORDER BY f.createdAt DESC
    """)
    List<TrainingFeedback> findByCoachId(@Param("coachId") UUID coachId);

    boolean existsByAttendanceId(UUID attendanceId);
}
