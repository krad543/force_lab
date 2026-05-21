DELETE FROM athlete_achievements;
DELETE FROM achievements;

INSERT INTO achievements (id, name, description, type, requirement_description, requirement_count, points, created_at) VALUES
                                                                                                                           (gen_random_uuid(), 'Первый шаг', 'Посетите первую тренировку', 'ATTENDANCE', 'Посетите 1 тренировку', 1, 10, NOW()),
                                                                                                                           (gen_random_uuid(), 'Пять тренировок', 'Посетите 5 тренировок', 'ATTENDANCE', 'Посетите 5 тренировок', 5, 30, NOW()),
                                                                                                                           (gen_random_uuid(), 'Десять тренировок', 'Посетите 10 тренировок', 'ATTENDANCE', 'Посетите 10 тренировок', 10, 50, NOW()),
                                                                                                                           (gen_random_uuid(), 'Двадцать пять тренировок', 'Посетите 25 тренировок', 'ATTENDANCE', 'Посетите 25 тренировок', 25, 100, NOW()),
                                                                                                                           (gen_random_uuid(), 'Пятьдесят тренировок', 'Посетите 50 тренировок', 'ATTENDANCE', 'Посетите 50 тренировок', 50, 200, NOW()),
                                                                                                                           (gen_random_uuid(), 'Первый рекорд', 'Установите первый личный рекорд', 'RECORD', 'Установите 1 рекорд', 1, 20, NOW()),
                                                                                                                           (gen_random_uuid(), 'Пять рекордов', 'Установите 5 личных рекордов', 'RECORD', 'Установите 5 рекордов', 5, 60, NOW()),
                                                                                                                           (gen_random_uuid(), 'Десять рекордов', 'Установите 10 личных рекордов', 'RECORD', 'Установите 10 рекордов', 10, 150, NOW());