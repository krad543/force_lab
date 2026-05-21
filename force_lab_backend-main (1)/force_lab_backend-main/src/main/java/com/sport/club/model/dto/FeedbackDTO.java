package com.sport.club.model.dto;

import com.sport.club.model.TrainingFeedback.LoadLevel;
import com.sport.club.model.TrainingFeedback.Mood;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class FeedbackDTO {

    // ── Запрос от спортсмена ──────────────────────────────────────────────────
    @Data
    public static class Request {
        private UUID attendanceId;
        private Integer rating;       // 1..5, обязательно
        private String comment;       // необязательно
        private LoadLevel loadLevel;  // EASY | MEDIUM | HARD
        private Mood mood;            // TIRED | NEUTRAL | GOOD | GREAT | ENERGIZED
    }

    // ── Ответ (для спортсмена и тренера) ─────────────────────────────────────
    @Data
    public static class Response {
        private UUID id;
        private UUID attendanceId;
        private UUID trainingId;
        private String trainingTitle;
        private String athleteName;   // для тренера
        private Integer rating;
        private String comment;
        private LoadLevel loadLevel;
        private Mood mood;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
