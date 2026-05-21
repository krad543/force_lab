import { useState } from 'react';

const MOODS = [
    { emoji: '😴', label: 'Устал', value: 'TIRED' },
    { emoji: '😐', label: 'Нормально', value: 'NEUTRAL' },
    { emoji: '😊', label: 'Хорошо', value: 'GOOD' },
    { emoji: '💪', label: 'Отлично', value: 'GREAT' },
    { emoji: '🔥', label: 'На подъёме', value: 'ENERGIZED' },
];

const LOAD_LEVELS = [
    { value: 'EASY', label: 'Лёгкая', color: '#4ade80' },
    { value: 'MEDIUM', label: 'Средняя', color: '#facc15' },
    { value: 'HARD', label: 'Тяжёлая', color: '#f87171' },
];

export default function FeedbackModal({ training, existingFeedback, onClose, onSubmit }) {
    const [rating, setRating] = useState(existingFeedback?.rating ?? 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState(existingFeedback?.comment ?? '');
    const [loadLevel, setLoadLevel] = useState(existingFeedback?.loadLevel ?? '');
    const [mood, setMood] = useState(existingFeedback?.mood ?? '');
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

    const isEdit = !!existingFeedback;

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <div style={styles.headerLabel}>ОТЗЫВ О ТРЕНИРОВКЕ</div>
                        <div style={styles.headerTitle}>{training.title}</div>
                        <div style={styles.headerDate}>
                            {new Date(training.startTime).toLocaleDateString('ru-RU', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })}
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div style={styles.body}>
                    {/* Stars */}
                    <div style={styles.section}>
                        <div style={styles.sectionLabel}>Общая оценка <span style={styles.required}>*</span></div>
                        <div style={styles.stars}>
                            {[1, 2, 3, 4, 5].map((star) => {
                                const filled = star <= (hoverRating || rating);
                                return (
                                    <button
                                        key={star}
                                        style={{ ...styles.starBtn, transform: filled ? 'scale(1.15)' : 'scale(1)' }}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        title={['', 'Плохо', 'Ниже среднего', 'Нормально', 'Хорошо', 'Отлично'][star]}
                                    >
                                        <svg width="36" height="36" viewBox="0 0 24 24"
                                            fill={filled ? '#f59e0b' : 'none'}
                                            stroke={filled ? '#f59e0b' : '#4a5568'}
                                            strokeWidth="1.5">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    </button>
                                );
                            })}
                            {rating > 0 && (
                                <span style={styles.ratingLabel}>
                                    {['', 'Плохо', 'Ниже среднего', 'Нормально', 'Хорошо', 'Отлично'][rating]}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Mood */}
                    <div style={styles.section}>
                        <div style={styles.sectionLabel}>Самочувствие</div>
                        <div style={styles.moodGrid}>
                            {MOODS.map((m) => (
                                <button
                                    key={m.value}
                                    style={{
                                        ...styles.moodBtn,
                                        ...(mood === m.value ? styles.moodBtnActive : {}),
                                    }}
                                    onClick={() => setMood(mood === m.value ? '' : m.value)}
                                >
                                    <span style={styles.moodEmoji}>{m.emoji}</span>
                                    <span style={styles.moodLabel}>{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Load level */}
                    <div style={styles.section}>
                        <div style={styles.sectionLabel}>Уровень нагрузки</div>
                        <div style={styles.loadGrid}>
                            {LOAD_LEVELS.map((l) => {
                                const active = loadLevel === l.value;
                                return (
                                    <button
                                        key={l.value}
                                        style={{
                                            ...styles.loadBtn,
                                            borderColor: active ? l.color : '#2d3748',
                                            backgroundColor: active ? `${l.color}18` : 'transparent',
                                            color: active ? l.color : '#a0aec0',
                                        }}
                                        onClick={() => setLoadLevel(loadLevel === l.value ? '' : l.value)}
                                    >
                                        <span style={{ ...styles.loadDot, backgroundColor: l.color }} />
                                        {l.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Comment */}
                    <div style={styles.section}>
                        <div style={styles.sectionLabel}>Комментарий</div>
                        <textarea
                            style={styles.textarea}
                            placeholder="Как прошла тренировка? Что понравилось или что стоит улучшить..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={500}
                        />
                        <div style={styles.charCount}>{comment.length} / 500</div>
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <button style={styles.cancelBtn} onClick={onClose}>Отмена</button>
                    <button
                        style={{
                            ...styles.submitBtn,
                            opacity: rating === 0 ? 0.5 : 1,
                            cursor: rating === 0 ? 'not-allowed' : 'pointer',
                        }}
                        onClick={handleSubmit}
                        disabled={rating === 0 || loading}
                    >
                        {loading ? 'Сохранение...' : isEdit ? 'Обновить отзыв' : 'Отправить отзыв'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = {
    overlay: {
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px',
        backdropFilter: 'blur(4px)',
    },
    modal: {
        backgroundColor: '#1a1f2e',
        border: '1px solid #2d3748',
        borderRadius: '16px',
        width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    },
    header: {
        padding: '24px 24px 20px',
        borderBottom: '1px solid #2d3748',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    },
    headerLabel: {
        fontSize: '10px', fontWeight: 700, letterSpacing: '2px',
        color: '#2a5298', marginBottom: '6px',
    },
    headerTitle: {
        fontSize: '18px', fontWeight: 700, color: '#f0f4ff', marginBottom: '4px',
    },
    headerDate: { fontSize: '13px', color: '#718096' },
    closeBtn: {
        background: 'none', border: 'none', color: '#718096',
        cursor: 'pointer', padding: '4px', borderRadius: '6px',
        display: 'flex', alignItems: 'center',
    },
    body: { padding: '20px 24px' },
    section: { marginBottom: '24px' },
    sectionLabel: {
        fontSize: '12px', fontWeight: 600, letterSpacing: '1px',
        color: '#a0aec0', textTransform: 'uppercase', marginBottom: '12px',
    },
    required: { color: '#f87171' },

    // Stars
    stars: { display: 'flex', alignItems: 'center', gap: '6px' },
    starBtn: {
        background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
        transition: 'transform 0.15s ease', lineHeight: 1,
    },
    ratingLabel: {
        marginLeft: '8px', fontSize: '14px', color: '#f59e0b', fontWeight: 600,
    },

    // Mood
    moodGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    moodBtn: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '4px', padding: '10px 14px', borderRadius: '10px',
        border: '1px solid #2d3748', background: 'transparent',
        cursor: 'pointer', transition: 'all 0.15s ease', minWidth: '64px',
    },
    moodBtnActive: {
        border: '1px solid #2a5298',
        backgroundColor: 'rgba(42,82,152,0.2)',
    },
    moodEmoji: { fontSize: '24px', lineHeight: 1 },
    moodLabel: { fontSize: '11px', color: '#a0aec0' },

    // Load
    loadGrid: { display: 'flex', gap: '10px' },
    loadBtn: {
        flex: 1, padding: '10px', borderRadius: '10px',
        border: '1px solid', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '8px', fontSize: '14px', fontWeight: 500,
        transition: 'all 0.15s ease',
    },
    loadDot: { width: '8px', height: '8px', borderRadius: '50%' },

    // Textarea
    textarea: {
        width: '100%', minHeight: '100px', padding: '12px',
        backgroundColor: '#0f1520', border: '1px solid #2d3748',
        borderRadius: '10px', color: '#e2e8f0', fontSize: '14px',
        resize: 'vertical', outline: 'none', fontFamily: 'inherit',
        lineHeight: 1.6, boxSizing: 'border-box',
    },
    charCount: { textAlign: 'right', fontSize: '11px', color: '#4a5568', marginTop: '4px' },

    // Footer
    footer: {
        padding: '16px 24px', borderTop: '1px solid #2d3748',
        display: 'flex', gap: '12px', justifyContent: 'flex-end',
    },
    cancelBtn: {
        padding: '10px 20px', borderRadius: '8px',
        border: '1px solid #2d3748', background: 'transparent',
        color: '#a0aec0', cursor: 'pointer', fontSize: '14px',
    },
    submitBtn: {
        padding: '10px 24px', borderRadius: '8px',
        background: 'linear-gradient(135deg, #1e3a7a, #2a5298)',
        border: 'none', color: '#fff', fontSize: '14px',
        fontWeight: 600, cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(42,82,152,0.4)',
    },
};
