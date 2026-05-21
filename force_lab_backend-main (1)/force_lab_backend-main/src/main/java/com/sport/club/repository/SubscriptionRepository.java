package com.sport.club.repository;

import com.sport.club.model.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    List<Subscription> findByAthleteId(UUID athleteId);
    List<Subscription> findByCoachId(UUID coachId);

    Optional<Subscription> findTopByAthleteIdOrderByEndDateDesc(UUID athleteId);

    // Найти истёкшие активные подписки
    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.endDate < :today")
    List<Subscription> findExpired(LocalDate today);
}
