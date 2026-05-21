package com.sport.club.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "competition_participants")
@Data
@NoArgsConstructor
public class CompetitionParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "competition_id", nullable = false)
    private UUID competitionId;

    @Column(name = "athlete_id", nullable = false)
    private UUID athleteId;

    private String status = "INVITED";

    @Column(name = "result_value")
    private BigDecimal resultValue;

    @Column(name = "result_unit")
    private String resultUnit;

    private Integer place;
    private Integer points = 0;
    private String notes;

    @Column(name = "registered_at")
    private LocalDateTime registeredAt;

    @PrePersist
    public void prePersist() { registeredAt = LocalDateTime.now(); }
}
