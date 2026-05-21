package com.sport.club.controller;

import com.sport.club.model.entity.Athlete;
import com.sport.club.model.entity.Subscription;
import com.sport.club.model.entity.User;
import com.sport.club.repository.AthleteRepository;
import com.sport.club.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final AthleteRepository athleteRepository;

    /**
     * POST /api/subscriptions
     * Тренер создаёт/обновляет подписку для спортсмена
     */
    @PostMapping
    public ResponseEntity<Map<String,Object>> createSubscription(
            @RequestBody Map<String,Object> body,
            @AuthenticationPrincipal User coach) {

        UUID athleteId = UUID.fromString((String) body.get("athleteId"));
        int months = Integer.parseInt(body.getOrDefault("periodMonths","1").toString());
        String notes = (String) body.getOrDefault("notes","");
        Object amountObj = body.get("amount");

        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new RuntimeException("Спортсмен не найден"));

        Subscription sub = new Subscription();
        sub.setAthleteId(athleteId);
        sub.setCoachId(coach.getId());
        sub.setStartDate(LocalDate.now());
        sub.setEndDate(LocalDate.now().plusMonths(months));
        sub.setPeriodMonths(months);
        sub.setNotes(notes);
        sub.setStatus("ACTIVE");
        if (amountObj != null) sub.setAmount(new BigDecimal(amountObj.toString()));

        // Разблокируем спортсмена
        try {
            var field = athlete.getClass().getDeclaredField("isBlocked");
            field.setAccessible(true);
            field.set(athlete, false);
            var subEndField = athlete.getClass().getDeclaredField("subscriptionEndDate");
            subEndField.setAccessible(true);
            subEndField.set(athlete, sub.getEndDate());
            athleteRepository.save(athlete);
        } catch (Exception ignored) {}

        subscriptionRepository.save(sub);

        Map<String,Object> result = new LinkedHashMap<>();
        result.put("id", sub.getId());
        result.put("startDate", sub.getStartDate());
        result.put("endDate", sub.getEndDate());
        result.put("periodMonths", months);
        result.put("status", "ACTIVE");
        result.put("message", "Подписка оформлена до " + sub.getEndDate());
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/subscriptions/athlete/{athleteId}
     * История подписок спортсмена
     */
    @GetMapping("/athlete/{athleteId}")
    public ResponseEntity<List<Subscription>> getAthleteSubscriptions(@PathVariable UUID athleteId) {
        return ResponseEntity.ok(subscriptionRepository.findByAthleteId(athleteId));
    }

    /**
     * GET /api/subscriptions/my
     * Текущая подписка спортсмена
     */
    @GetMapping("/my")
    public ResponseEntity<Map<String,Object>> getMySubscription(@AuthenticationPrincipal User user) {
        Athlete athlete = athleteRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Профиль не найден"));

        Optional<Subscription> sub = subscriptionRepository
                .findTopByAthleteIdOrderByEndDateDesc(athlete.getId());

        Map<String,Object> result = new LinkedHashMap<>();
        if (sub.isPresent()) {
            Subscription s = sub.get();
            result.put("exists", true);
            result.put("endDate", s.getEndDate());
            result.put("status", s.getStatus());
            result.put("daysLeft", LocalDate.now().until(s.getEndDate()).getDays());
            result.put("isExpired", s.getEndDate().isBefore(LocalDate.now()));
        } else {
            result.put("exists", false);
            result.put("isExpired", true);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/subscriptions/coach — список подписок тренера
     */
    @GetMapping("/coach")
    public ResponseEntity<List<Map<String,Object>>> getCoachSubscriptions(@AuthenticationPrincipal User coach) {
        List<Subscription> subs = subscriptionRepository.findByCoachId(coach.getId());
        List<Map<String,Object>> result = subs.stream().map(s -> {
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("athleteId", s.getAthleteId());
            m.put("startDate", s.getStartDate());
            m.put("endDate", s.getEndDate());
            m.put("periodMonths", s.getPeriodMonths());
            m.put("status", s.getStatus());
            m.put("daysLeft", LocalDate.now().until(s.getEndDate()).getDays());
            athleteRepository.findById(s.getAthleteId()).ifPresent(a -> {
                m.put("athleteName", a.getUser() != null ? a.getUser().getFullName() : "");
                m.put("sportType", a.getSportType());
            });
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /**
     * Автоматическая проверка истёкших подписок — каждый день в 00:01
     */
    @Scheduled(cron = "0 1 0 * * *")
    public void checkExpiredSubscriptions() {
        List<Subscription> expired = subscriptionRepository.findExpired(LocalDate.now());
        for (Subscription s : expired) {
            s.setStatus("EXPIRED");
            subscriptionRepository.save(s);
            // Блокируем спортсмена
            athleteRepository.findById(s.getAthleteId()).ifPresent(athlete -> {
                try {
                    var field = athlete.getClass().getDeclaredField("isBlocked");
                    field.setAccessible(true);
                    field.set(athlete, true);
                    athleteRepository.save(athlete);
                } catch (Exception ignored) {}
            });
        }
        if (!expired.isEmpty()) {
            System.out.println("Заблокировано спортсменов с истёкшей подпиской: " + expired.size());
        }
    }
}
