package com.sport.club.controller;

import com.sport.club.model.entity.Club;
import com.sport.club.model.entity.User;
import com.sport.club.repository.ClubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ClubController {

    private final ClubRepository clubRepository;

    /** Получить все клубы (для регистрации спортсмена) */
    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs() {
        return ResponseEntity.ok(clubRepository.findAll());
    }

    /** Получить клубы тренера */
    @GetMapping("/my")
    public ResponseEntity<List<Club>> getMyClubs(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(clubRepository.findByCoachId(user.getId()));
    }

    /** Создать клуб (только тренер) */
    @PostMapping
    public ResponseEntity<Club> createClub(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        Club club = new Club();
        club.setName(body.get("name"));
        club.setDescription(body.get("description"));
        club.setSportType(body.get("sportType"));
        club.setCoachId(user.getId());
        return ResponseEntity.ok(clubRepository.save(club));
    }

    /** Удалить клуб */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClub(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Клуб не найден"));
        if (!club.getCoachId().equals(user.getId()))
            throw new RuntimeException("Нет доступа");
        clubRepository.delete(club);
        return ResponseEntity.ok().build();
    }
}
