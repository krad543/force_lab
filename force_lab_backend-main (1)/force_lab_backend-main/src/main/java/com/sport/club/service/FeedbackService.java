package com.sport.club.service;

import com.sport.club.model.TrainingFeedback;
import com.sport.club.model.entity.Athlete;
import com.sport.club.model.entity.TrainingAttendance;
import com.sport.club.model.entity.Training;
import com.sport.club.model.entity.User;
import com.sport.club.model.dto.FeedbackDTO;
import com.sport.club.repository.AthleteRepository;
import com.sport.club.repository.FeedbackRepository;
import com.sport.club.repository.TrainingAttendanceRepository;
import com.sport.club.repository.TrainingRepository;
import com.sport.club.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final TrainingAttendanceRepository attendanceRepository;
    private final TrainingRepository trainingRepository;
    private final UserRepository userRepository;
    private final AthleteRepository athleteRepository; // ← добавлено

    @Transactional
    public FeedbackDTO.Response submitFeedback(FeedbackDTO.Request req, User currentUser) {

        TrainingAttendance attendance = attendanceRepository.findById(req.getAttendanceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Запись не найдена"));

        // athleteId в attendance = id из таблицы athletes, ищем через userId
        Athlete athlete = athleteRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Профиль спортсмена не найден"));

        if (!attendance.getAthleteId().equals(athlete.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Нет доступа");
        }

        Training training = trainingRepository.findById(attendance.getTrainingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Тренировка не найдена"));

        // Конец тренировки = дата + длительность
        LocalDateTime endTime = training.getTrainingDate().plusMinutes(
                training.getDurationMinutes() != null ? training.getDurationMinutes() : 60
        );
        if (endTime.isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Тренировка ещё не завершена");
        }

        String status = attendance.getStatus();
        if ("ABSENT".equals(status) || "REGISTERED".equals(status) || status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Фидбек доступен только для посещённых тренировок");
        }

        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Оценка должна быть от 1 до 5");
        }

        TrainingFeedback feedback = feedbackRepository.findByAttendanceId(req.getAttendanceId())
                .orElse(new TrainingFeedback());

        feedback.setAttendanceId(attendance.getId());
        feedback.setTrainingId(attendance.getTrainingId());
        feedback.setAthleteId(attendance.getAthleteId());
        feedback.setRating(req.getRating());
        feedback.setComment(req.getComment());
        feedback.setLoadLevel(req.getLoadLevel());
        feedback.setMood(req.getMood());

        return toResponse(feedbackRepository.save(feedback), training);
    }

    public FeedbackDTO.Response getFeedbackByAttendance(UUID attendanceId, User currentUser) {
        TrainingAttendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Запись не найдена"));

        Training training = trainingRepository.findById(attendance.getTrainingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Тренировка не найдена"));

        // Проверяем: спортсмен (через athlete.id) или тренер тренировки
        boolean isCoach = training.getCoachId().equals(currentUser.getId());
        boolean isAthlete = athleteRepository.findByUserId(currentUser.getId())
                .map(a -> a.getId().equals(attendance.getAthleteId()))
                .orElse(false);

        if (!isAthlete && !isCoach) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Нет доступа");
        }

        return feedbackRepository.findByAttendanceId(attendanceId)
                .map(f -> toResponse(f, training))
                .orElse(null);
    }

    public List<FeedbackDTO.Response> getFeedbackByTraining(UUID trainingId, User currentUser) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Тренировка не найдена"));

        return feedbackRepository.findByTrainingId(trainingId)
                .stream().map(f -> toResponse(f, training)).collect(Collectors.toList());
    }

    public List<FeedbackDTO.Response> getCoachFeedbacks(User currentUser) {
        return feedbackRepository.findByCoachId(currentUser.getId())
                .stream().map(f -> {
                    Training training = trainingRepository.findById(f.getTrainingId()).orElse(null);
                    return toResponse(f, training);
                }).collect(Collectors.toList());
    }

    private FeedbackDTO.Response toResponse(TrainingFeedback f, Training training) {
        FeedbackDTO.Response r = new FeedbackDTO.Response();
        r.setId(f.getId());
        r.setAttendanceId(f.getAttendanceId());
        r.setTrainingId(f.getTrainingId());
        r.setTrainingTitle(training != null ? training.getTitle() : "");

        // athleteId в feedback = id из таблицы athletes, ищем user через athlete
        athleteRepository.findById(f.getAthleteId()).ifPresent(athlete -> {
            User user = athlete.getUser();
            if (user != null) r.setAthleteName(user.getFullName());
        });

        r.setRating(f.getRating());
        r.setComment(f.getComment());
        r.setLoadLevel(f.getLoadLevel());
        r.setMood(f.getMood());
        r.setCreatedAt(f.getCreatedAt());
        r.setUpdatedAt(f.getUpdatedAt());
        return r;
    }
}