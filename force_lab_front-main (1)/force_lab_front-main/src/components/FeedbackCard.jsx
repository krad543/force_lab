const MOOD_MAP = {
    TIRED: { emoji: '😴', label: 'Устал' },
    NEUTRAL: { emoji: '😐', label: 'Нормально' },
    GOOD: { emoji: '😊', label: 'Хорошо' },
    GREAT: { emoji: '💪', label: 'Отлично' },
    ENERGIZED: { emoji: '🔥', label: 'На подъёме' },
};

const LOAD_MAP = {
    EASY: { label: 'Лёгкая', color: '#4ade80' },
    MEDIUM: { label: 'Средняя', color: '#facc15' },
    HARD: { label: 'Тяжёлая', color: '#f87171' },
};

export default function FeedbackCard({ feedback, athleteName, onEdit, isCoach = false }) {
    if (!feedback) return null;

    const mood = MOOD_MAP[feedback.mood];
    const load = LOAD_MAP[feedback.loadLevel];

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    {isCoach && athleteName && (
                        <div style={styles.athleteName}>{athleteName}</div>
                    )}
                    <div style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} width="14" height="14" viewBox="0 0 24 24"
                                fill={s <= feedback.rating ? '#f59e0b' : 'none'}
                                stroke={s <= feedback.rating ? '#f59e0b' : '#4a5568'}
                                strokeWidth="1.5">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        ))}
                        <span style={styles.ratingNum}>{feedback.rating}/5</span>
                    </div>
                </div>
                <div style={styles.meta}>
                    {feedback.createdAt && (
                        <span style={styles.date}>
                            {new Date(feedback.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                    )}
                    {!isCoach && onEdit && (
                        <button style={styles.editBtn} onClick={onEdit}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Изменить
                        </button>
                    )}
                </div>
            </div>

            <div style={styles.badges}>
                {mood && (
                    <span style={styles.badge}>
                        {mood.emoji} {mood.label}
                    </span>
                )}
                {load && (
                    <span style={{ ...styles.badge, borderColor: `${load.color}40`, color: load.color, backgroundColor: `${load.color}12` }}>
                        <span style={{ ...styles.dot, backgroundColor: load.color }} />
                        {load.label} нагрузка
                    </span>
                )}
            </div>

            {feedback.comment && (
                <p style={styles.comment}>«{feedback.comment}»</p>
            )}
        </div>
    );
}

const styles = {
    card: {
        backgroundColor: 'rgba(42,82,152,0.08)',
        border: '1px solid rgba(42,82,152,0.2)',
        borderRadius: '10px', padding: '14px 16px',
        marginTop: '12px',
    },
    header: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '10px',
    },
    headerLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
    athleteName: { fontSize: '13px', fontWeight: 600, color: '#e2e8f0' },
    ratingRow: { display: 'flex', alignItems: 'center', gap: '3px' },
    ratingNum: { fontSize: '12px', color: '#f59e0b', marginLeft: '4px', fontWeight: 600 },
    meta: { display: 'flex', alignItems: 'center', gap: '10px' },
    date: { fontSize: '11px', color: '#4a5568' },
    editBtn: {
        display: 'flex', alignItems: 'center', gap: '4px',
        background: 'none', border: '1px solid #2d3748',
        color: '#718096', cursor: 'pointer', fontSize: '11px',
        padding: '4px 8px', borderRadius: '6px',
    },
    badges: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' },
    badge: {
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        fontSize: '12px', padding: '3px 10px', borderRadius: '20px',
        border: '1px solid #2d3748', color: '#a0aec0',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    dot: { width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block' },
    comment: {
        fontSize: '13px', color: '#a0aec0', fontStyle: 'italic',
        lineHeight: 1.6, margin: '6px 0 0',
        borderLeft: '2px solid #2a5298', paddingLeft: '10px',
    },
};
