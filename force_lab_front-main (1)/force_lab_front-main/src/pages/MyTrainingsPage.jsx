import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import "./MyTrainingsPage.css";

// ── Константы для фидбека ────────────────────────────────────────────────────
const MOODS = [
    { emoji: "😴", label: "Устал", value: "TIRED" },
    { emoji: "😐", label: "Нормально", value: "NEUTRAL" },
    { emoji: "😊", label: "Хорошо", value: "GOOD" },
    { emoji: "💪", label: "Отлично", value: "GREAT" },
    { emoji: "🔥", label: "На подъёме", value: "ENERGIZED" },
];

const LOAD_LEVELS = [
    { value: "EASY", label: "Лёгкая", color: "#4ade80" },
    { value: "MEDIUM", label: "Средняя", color: "#facc15" },
    { value: "HARD", label: "Тяжёлая", color: "#f87171" },
];

const MOOD_MAP = {
    TIRED: { emoji: "😴", label: "Устал" },
    NEUTRAL: { emoji: "😐", label: "Нормально" },
    GOOD: { emoji: "😊", label: "Хорошо" },
    GREAT: { emoji: "💪", label: "Отлично" },
    ENERGIZED: { emoji: "🔥", label: "На подъёме" },
};

const LOAD_MAP = {
    EASY: { label: "Лёгкая", color: "#4ade80" },
    MEDIUM: { label: "Средняя", color: "#facc15" },
    HARD: { label: "Тяжёлая", color: "#f87171" },
};

// ── Модальное окно фидбека ───────────────────────────────────────────────────
const FeedbackModal = ({ training, existingFeedback, onClose, onSubmit }) => {
    const [rating, setRating] = useState(existingFeedback?.rating ?? 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState(existingFeedback?.comment ?? "");
    const [loadLevel, setLoadLevel] = useState(existingFeedback?.loadLevel ?? "");
    const [mood, setMood] = useState(existingFeedback?.mood ?? "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!rating) return;
        setLoading(true);
        try {
            await onSubmit({ rating, comment, loadLevel, mood });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fb-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="fb-modal">
                <div className="fb-header">
                    <div>
                        <div className="fb-label">ОТЗЫВ О ТРЕНИРОВКЕ</div>
                        <div className="fb-title">{training.title}</div>
                        <div className="fb-date">
                            {new Date(training.trainingDate).toLocaleDateString("ru-RU", {
                                day: "numeric", month: "long", year: "numeric",
                            })}
                        </div>
                    </div>
                    <button className="fb-close" onClick={onClose}>✕</button>
                </div>

                <div className="fb-body">
                    {/* Звёзды */}
                    <div className="fb-section">
                        <div className="fb-section-label">Общая оценка <span className="fb-required">*</span></div>
                        <div className="fb-stars">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const filled = star <= (hoverRating || rating);
                                return (
                                    <button
                                        key={star}
                                        className="fb-star-btn"
                                        style={{ transform: filled ? "scale(1.2)" : "scale(1)" }}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <svg width="32" height="32" viewBox="0 0 24 24"
                                            fill={filled ? "#f59e0b" : "none"}
                                            stroke={filled ? "#f59e0b" : "#94a3b8"}
                                            strokeWidth="1.5">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    </button>
                                );
                            })}
                            {rating > 0 && (
                                <span className="fb-rating-label">
                                    {["", "Плохо", "Ниже среднего", "Нормально", "Хорошо", "Отлично"][rating]}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Самочувствие */}
                    <div className="fb-section">
                        <div className="fb-section-label">Самочувствие</div>
                        <div className="fb-mood-grid">
                            {MOODS.map((m) => (
                                <button
                                    key={m.value}
                                    className={`fb-mood-btn ${mood === m.value ? "active" : ""}`}
                                    onClick={() => setMood(mood === m.value ? "" : m.value)}
                                >
                                    <span className="fb-emoji">{m.emoji}</span>
                                    <span className="fb-mood-label">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Нагрузка */}
                    <div className="fb-section">
                        <div className="fb-section-label">Уровень нагрузки</div>
                        <div className="fb-load-grid">
                            {LOAD_LEVELS.map((l) => (
                                <button
                                    key={l.value}
                                    className="fb-load-btn"
                                    style={{
                                        borderColor: loadLevel === l.value ? l.color : "#e2e8f0",
                                        backgroundColor: loadLevel === l.value ? `${l.color}18` : "transparent",
                                        color: loadLevel === l.value ? l.color : "#64748b",
                                    }}
                                    onClick={() => setLoadLevel(loadLevel === l.value ? "" : l.value)}
                                >
                                    <span className="fb-dot" style={{ backgroundColor: l.color }} />
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Комментарий */}
                    <div className="fb-section">
                        <div className="fb-section-label">Комментарий</div>
                        <textarea
                            className="fb-textarea"
                            placeholder="Как прошла тренировка? Что понравилось или что стоит улучшить..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={500}
                        />
                        <div className="fb-char-count">{comment.length} / 500</div>
                    </div>
                </div>

                <div className="fb-footer">
                    <button className="fb-cancel-btn" onClick={onClose}>Отмена</button>
                    <button
                        className="fb-submit-btn"
                        style={{ opacity: rating === 0 ? 0.5 : 1 }}
                        onClick={handleSubmit}
                        disabled={rating === 0 || loading}
                    >
                        {loading ? "Сохранение..." : existingFeedback ? "Обновить отзыв" : "Отправить отзыв"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Карточка отзыва ──────────────────────────────────────────────────────────
const FeedbackCard = ({ feedback, onEdit }) => {
    if (!feedback) return null;
    const mood = MOOD_MAP[feedback.mood];
    const load = LOAD_MAP[feedback.loadLevel];

    return (
        <div className="fb-card">
            <div className="fb-card-header">
                <div className="fb-card-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} width="13" height="13" viewBox="0 0 24 24"
                            fill={s <= feedback.rating ? "#f59e0b" : "none"}
                            stroke={s <= feedback.rating ? "#f59e0b" : "#cbd5e1"}
                            strokeWidth="1.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    ))}
                    <span className="fb-card-rating">{feedback.rating}/5</span>
                </div>
                <button className="fb-edit-btn" onClick={onEdit}>✏️ Изменить</button>
            </div>

            <div className="fb-card-badges">
                {mood && <span className="fb-badge">{mood.emoji} {mood.label}</span>}
                {load && (
                    <span className="fb-badge" style={{ color: load.color, borderColor: `${load.color}50`, backgroundColor: `${load.color}10` }}>
                        <span className="fb-dot" style={{ backgroundColor: load.color }} />
                        {load.label} нагрузка
                    </span>
                )}
            </div>

            {feedback.comment && (
                <p className="fb-card-comment">«{feedback.comment}»</p>
            )}
        </div>
    );
};

// ── Основной компонент ───────────────────────────────────────────────────────
const MyTrainingsPage = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const { userData, triggerUpdate } = useAuth();

    const [myTrainings, setMyTrainings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("active");

    // Фидбек
    const [feedbackModal, setFeedbackModal] = useState(null);
    const [feedbacks, setFeedbacks] = useState({});

    const fetchMyTrainings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(
                "http://localhost:8080/api/trainings/my-with-status"
            );
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Ошибка загрузки");
            }
            const data = await response.json();
            setMyTrainings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Загрузка фидбеков для завершённых тренировок
    const fetchFeedbacks = useCallback(async (trainings) => {
        const completed = trainings.filter(
            (t) => new Date(t.trainingDate) <= new Date() &&
                (t.status === "ATTENDED" || t.status === "LATE")
        );
        const results = {};
        await Promise.all(
            completed.map(async (t) => {
                try {
                    const token = sessionStorage.getItem("accessToken");
                    const res = await fetch(
                        `http://localhost:8080/api/feedback/attendance/${t.attendanceId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (res.ok) {
                        const fb = await res.json();
                        if (fb) results[t.attendanceId] = fb;
                    }
                } catch (e) { }
            })
        );
        setFeedbacks(results);
    }, []);

    const getUserId = () => {
        const token = sessionStorage.getItem("accessToken");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                return payload.sub;
            } catch (e) { }
        }
        return null;
    };

    const userId = getUserId();

    useEffect(() => {
        if (!userId) return;
        const eventSource = new EventSource(
            `http://localhost:8080/api/sse/subscribe?userId=${userId}`
        );
        eventSource.addEventListener("training-updated", () => fetchMyTrainings());
        eventSource.addEventListener("attendance-marked", (event) => {
            const data = JSON.parse(event.data);
            fetchMyTrainings();
            if (data.message) addNotification(data.message, "info");
        });
        eventSource.onerror = () => { };
        return () => eventSource.close();
    }, [userId]);

    useEffect(() => { fetchMyTrainings(); }, [triggerUpdate]);

    useEffect(() => {
        const handleFocus = () => fetchMyTrainings();
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [fetchMyTrainings]);

    // Когда загрузились тренировки — подгружаем фидбеки
    useEffect(() => {
        if (myTrainings.length > 0) fetchFeedbacks(myTrainings);
    }, [myTrainings]);

    const handleCancelRegistration = async (trainingId) => {
        try {
            const response = await fetchWithAuth(
                `http://localhost:8080/api/trainings/${trainingId}/cancel`,
                { method: "DELETE" }
            );
            if (!response.ok) throw new Error("Ошибка отмены");
            addNotification("Регистрация отменена", "info");
            await fetchMyTrainings();
        } catch (err) {
            addNotification(err.message, "error");
        }
    };

    const handleSubmitFeedback = async (trainingId, attendanceId, data) => {
        try {
            const token = sessionStorage.getItem("accessToken");
            const res = await fetch("http://localhost:8080/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ attendanceId, ...data }),
            });
            if (!res.ok) throw new Error("Ошибка отправки отзыва");
            const result = await res.json();
            setFeedbacks((prev) => ({ ...prev, [attendanceId]: result }));
            addNotification("Отзыв сохранён!", "success");
        } catch (err) {
            addNotification(err.message, "error");
            throw err;
        }
    };

    const filteredTrainings = myTrainings.filter((training) => {
        const now = new Date();
        const trainingDate = new Date(training.trainingDate);
        return activeTab === "active" ? trainingDate > now : trainingDate <= now;
    });

    const canLeaveFeedback = (training) =>
        new Date(training.trainingDate) <= new Date() &&
        (training.status === "ATTENDED" || training.status === "LATE");

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="my-trainings-page">
            <header className="header">
                <div className="container header-container">
                    <div className="logo" onClick={() => navigate("/")}>
                        <span className="logo-text">FORCE LAB</span>
                    </div>
                    <div className="header-actions">
                        <button className="btn-outline" onClick={() => navigate("/")}>
                            На главную
                        </button>
                        <button className="btn-primary" onClick={() => navigate("/trainings")}>
                            Все тренировки
                        </button>
                    </div>
                </div>
            </header>

            <main className="container">
                <h1 className="page-title">Мои тренировки</h1>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "active" ? "active" : ""}`}
                        onClick={() => setActiveTab("active")}
                    >
                        Активные ({myTrainings.filter((t) => new Date(t.trainingDate) > new Date()).length})
                    </button>
                    <button
                        className={`tab ${activeTab === "completed" ? "active" : ""}`}
                        onClick={() => setActiveTab("completed")}
                    >
                        Завершенные ({myTrainings.filter((t) => new Date(t.trainingDate) <= new Date()).length})
                    </button>
                </div>

                {filteredTrainings.length === 0 ? (
                    <div className="no-data">
                        <p>Нет {activeTab === "active" ? "активных" : "завершенных"} тренировок</p>
                    </div>
                ) : (
                    <div className="trainings-list">
                        {filteredTrainings.map((training) => (
                            <div key={training.id} className="training-item">
                                <div className="training-item-left">
                                    <div className="training-date-badge">
                                        <span className="date-day">{new Date(training.trainingDate).getDate()}</span>
                                        <span className="date-month">
                                            {new Date(training.trainingDate).toLocaleString("ru-RU", { month: "short" })}
                                        </span>
                                    </div>
                                </div>

                                <div className="training-item-body">
                                    <div className="training-item-header">
                                        <h3>{training.title}</h3>
                                        <span className="training-sport-tag">{training.sportType}</span>
                                    </div>

                                    <div className="training-item-meta">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        <span>{new Date(training.trainingDate).toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
                                        <span className="meta-sep">·</span>
                                        <span>{training.durationMinutes} мин</span>
                                        {training.location && <><span className="meta-sep">·</span><span>{training.location}</span></>}
                                    </div>

                                    <div className="training-item-meta">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                                        </svg>
                                        <span>{training.coachName || "Тренер не назначен"}</span>
                                    </div>

                                    <div className="training-item-meta">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        <span className={
                                            training.status === "ATTENDED" ? "status-attended" :
                                                training.status === "LATE" ? "status-late" :
                                                    training.status === "ABSENT" ? "status-absent" : "status-registered"
                                        }>
                                            {training.status === "ATTENDED" ? "Присутствовал" :
                                                training.status === "LATE" ? "Опоздал" :
                                                    training.status === "ABSENT" ? "Не пришел" : "Записан"}
                                        </span>
                                    </div>

                                    {training.description && (
                                        <p className="training-item-desc">{training.description}</p>
                                    )}

                                    {/* ── Блок фидбека ── */}
                                    {canLeaveFeedback(training) && (
                                        <div className="fb-section-wrapper">
                                            {feedbacks[training.attendanceId] ? (
                                                <FeedbackCard
                                                    feedback={feedbacks[training.attendanceId]}
                                                    onEdit={() => setFeedbackModal(training)}
                                                />
                                            ) : (
                                                <button
                                                    className="fb-leave-btn"
                                                    onClick={() => setFeedbackModal(training)}
                                                >
                                                    ✍️ Оставить отзыв
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {new Date(training.trainingDate) > new Date() && (
                                    <button className="btn-cancel" onClick={() => handleCancelRegistration(training.id)}>
                                        Отменить
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Модальное окно фидбека */}
            {feedbackModal && (
                <FeedbackModal
                    training={feedbackModal}
                    existingFeedback={feedbacks[feedbackModal.attendanceId]}
                    onClose={() => setFeedbackModal(null)}
                    onSubmit={(data) => handleSubmitFeedback(feedbackModal.id, feedbackModal.attendanceId, data)}
                />
            )}
        </div>
    );
};

export default MyTrainingsPage;
