const BASE = 'http://localhost:8080/api';

function getHeaders() {
    const token = sessionStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ── Спортсмен: оставить или обновить фидбек ──────────────────────────────────
export async function submitFeedback(attendanceId, data) {
    const res = await fetch(`${BASE}/feedback`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ attendanceId, ...data }),
    });
    if (!res.ok) throw new Error('Ошибка при отправке отзыва');
    return res.json();
}

// ── Спортсмен: получить свой фидбек по attendanceId ─────────────────────────
export async function getMyFeedback(attendanceId) {
    const res = await fetch(`${BASE}/feedback/attendance/${attendanceId}`, {
        headers: getHeaders(),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Ошибка загрузки отзыва');
    return res.json();
}

// ── Тренер: получить все фидбеки по тренировке ──────────────────────────────
export async function getFeedbackByTraining(trainingId) {
    const res = await fetch(`${BASE}/feedback/training/${trainingId}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Ошибка загрузки отзывов');
    return res.json();
}

// ── Тренер: получить все фидбеки своих спортсменов ──────────────────────────
export async function getCoachFeedbacks() {
    const res = await fetch(`${BASE}/feedback/coach`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Ошибка загрузки отзывов');
    return res.json();
}
