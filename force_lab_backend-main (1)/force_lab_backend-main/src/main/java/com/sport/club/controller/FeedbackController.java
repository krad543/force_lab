package com.sport.club.controller;

import com.sport.club.model.entity.User;
import com.sport.club.model.dto.FeedbackDTO;
import com.sport.club.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class FeedbackController {

    private final FeedbackService feedbackService;

    /**
     * POST /api/feedback
     * Спортсмен создаёт или обновляет отзыв о тренировке
     */
    @PostMapping
    public ResponseEntity<FeedbackDTO.Response> submitFeedback(
            @RequestBody FeedbackDTO.Request request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(feedbackService.submitFeedback(request, currentUser));
    }

    /**
     * GET /api/feedback/attendance/{attendanceId}
     * Получить фидбек по attendanceId (спортсмен или тренер)
     */
    @GetMapping("/attendance/{attendanceId}")
    public ResponseEntity<FeedbackDTO.Response> getFeedbackByAttendance(
            @PathVariable UUID attendanceId,
            @AuthenticationPrincipal User currentUser) {
        FeedbackDTO.Response response = feedbackService.getFeedbackByAttendance(attendanceId, currentUser);
        if (response == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/feedback/training/{trainingId}
     * Тренер получает все отзывы по конкретной тренировке
     */
    @GetMapping("/training/{trainingId}")
    public ResponseEntity<List<FeedbackDTO.Response>> getFeedbackByTraining(
            @PathVariable UUID trainingId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(feedbackService.getFeedbackByTraining(trainingId, currentUser));
    }

    /**
     * GET /api/feedback/coach
     * Тренер получает все отзывы своих спортсменов
     */
    @GetMapping("/coach")
    public ResponseEntity<List<FeedbackDTO.Response>> getCoachFeedbacks(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(feedbackService.getCoachFeedbacks(currentUser));
    }
}
