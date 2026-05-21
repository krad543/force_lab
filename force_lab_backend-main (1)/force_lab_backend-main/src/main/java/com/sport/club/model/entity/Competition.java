package com.sport.club.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "competitions")
@Data
@NoArgsConstructor
public class Competition {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sport_type", nullable = false)
    private String sportType;

    @Column(name = "competition_date", nullable = false)
    private LocalDateTime competitionDate;

    private String location;

    @Column(name = "coach_id", nullable = false)
    private UUID coachId;

    @Column(name = "tournament_type")
    private String tournamentType = "ROUND_ROBIN";

    @Column(name = "result_type")
    private String resultType = "TIME";

    private String status = "UPCOMING";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() { createdAt = LocalDateTime.now(); }
}
