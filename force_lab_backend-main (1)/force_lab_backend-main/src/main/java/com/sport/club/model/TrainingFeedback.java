package com.sport.club.model;

import com.sport.club.model.TrainingFeedback.LoadLevel;
import com.sport.club.model.TrainingFeedback.Mood;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "training_feedbacks")
@Data
@NoArgsConstructor
public class TrainingFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "attendance_id", nullable = false, unique = true)
    private UUID attendanceId;

    @Column(name = "training_id", nullable = false)
    private UUID trainingId;

    @Column(name = "athlete_id", nullable = false)
    private UUID athleteId;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(name = "load_level")
    private LoadLevel loadLevel;

    @Enumerated(EnumType.STRING)
    private Mood mood;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum LoadLevel { EASY, MEDIUM, HARD }
    public enum Mood { TIRED, NEUTRAL, GOOD, GREAT, ENERGIZED }
}
