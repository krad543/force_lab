package com.sport.club.controller;

import com.sport.club.model.entity.*;
import com.sport.club.repository.*;
import com.sport.club.service.AthleteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/competitions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CompetitionController {

    private final CompetitionRepository competitionRepository;
    private final CompetitionParticipantRepository participantRepository;
    private final AthleteRepository athleteRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Map<String,Object>>> getAll() {
        List<Competition> comps = competitionRepository.findAll();
        List<Map<String,Object>> result = comps.stream().map(c -> {
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("id", c.getId()); m.put("title", c.getTitle());
            m.put("description", c.getDescription()); m.put("sportType", c.getSportType());
            m.put("competitionDate", c.getCompetitionDate()); m.put("location", c.getLocation());
            m.put("tournamentType", c.getTournamentType()); m.put("resultType", c.getResultType());
            m.put("status", c.getStatus());
            long cnt = participantRepository.findByCompetitionId(c.getId()).stream()
                .filter(p -> "ACCEPTED".equals(p.getStatus())).count();
            m.put("participantsCount", cnt);
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Competition> create(@RequestBody Map<String,Object> body, @AuthenticationPrincipal User user) {
        Competition c = new Competition();
        c.setTitle((String) body.get("title"));
        c.setDescription((String) body.get("description"));
        c.setSportType((String) body.get("sportType"));
        c.setCompetitionDate(LocalDateTime.parse((String) body.get("competitionDate")));
        c.setLocation((String) body.get("location"));
        c.setTournamentType((String) body.getOrDefault("tournamentType", "ROUND_ROBIN"));
        c.setResultType((String) body.getOrDefault("resultType", "TIME"));
        c.setCoachId(user.getId());
        return ResponseEntity.ok(competitionRepository.save(c));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Map<String,String>> accept(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        Athlete athlete = athleteRepository.findByUserId(user.getId())
            .orElseThrow(() -> new RuntimeException("Профиль спортсмена не найден"));
        Optional<CompetitionParticipant> existing = participantRepository.findByCompetitionIdAndAthleteId(id, athlete.getId());
        CompetitionParticipant p = existing.orElse(new CompetitionParticipant());
        p.setCompetitionId(id); p.setAthleteId(athlete.getId()); p.setStatus("ACCEPTED");
        participantRepository.save(p);
        return ResponseEntity.ok(Map.of("message", "Вы записаны на соревнование"));
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<Map<String,String>> decline(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        Athlete athlete = athleteRepository.findByUserId(user.getId())
            .orElseThrow(() -> new RuntimeException("Профиль спортсмена не найден"));
        Optional<CompetitionParticipant> existing = participantRepository.findByCompetitionIdAndAthleteId(id, athlete.getId());
        CompetitionParticipant p = existing.orElse(new CompetitionParticipant());
        p.setCompetitionId(id); p.setAthleteId(athlete.getId()); p.setStatus("DECLINED");
        participantRepository.save(p);
        return ResponseEntity.ok(Map.of("message", "Вы отказались от участия"));
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<Map<String,Object>>> getParticipants(@PathVariable UUID id) {
        List<CompetitionParticipant> parts = participantRepository.findByCompetitionId(id);
        List<Map<String,Object>> result = parts.stream().map(p -> {
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("id", p.getId()); m.put("athleteId", p.getAthleteId());
            m.put("status", p.getStatus()); m.put("resultValue", p.getResultValue());
            m.put("resultUnit", p.getResultUnit()); m.put("place", p.getPlace());
            m.put("points", p.getPoints());
            athleteRepository.findById(p.getAthleteId()).ifPresent(a -> {
                m.put("fullName", a.getUser() != null ? a.getUser().getFullName() : "");
                m.put("sportType", a.getSportType());
            });
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/result")
    public ResponseEntity<Map<String,String>> saveResult(
            @PathVariable UUID id,
            @RequestBody Map<String,Object> body,
            @AuthenticationPrincipal User user) {
        UUID athleteId = UUID.fromString((String) body.get("athleteId"));
        CompetitionParticipant p = participantRepository.findByCompetitionIdAndAthleteId(id, athleteId)
            .orElseThrow(() -> new RuntimeException("Участник не найден"));
        p.setResultValue(new BigDecimal(body.get("resultValue").toString()));
        p.setResultUnit((String) body.get("resultUnit"));
        participantRepository.save(p);
        // Пересчитываем места
        recalculatePlaces(id);
        return ResponseEntity.ok(Map.of("message", "Результат сохранён"));
    }

    private void recalculatePlaces(UUID compId) {
        List<CompetitionParticipant> parts = participantRepository.findByCompetitionId(compId)
            .stream().filter(p -> p.getResultValue() != null)
            .sorted(Comparator.comparing(CompetitionParticipant::getResultValue))
            .collect(Collectors.toList());
        for (int i = 0; i < parts.size(); i++) {
            parts.get(i).setPlace(i + 1);
            participantRepository.save(parts.get(i));
        }
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<List<Object>> getMatches(@PathVariable UUID id) {
        return ResponseEntity.ok(List.of()); // расширяется при необходимости
    }
}
