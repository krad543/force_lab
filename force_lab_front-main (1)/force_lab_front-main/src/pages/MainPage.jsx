import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchWithAuth } from "../api";
import "./MainPage.css";

const QUOTES = [
    { text: "Чемпион — это не тот, кто никогда не падает, а тот, кто встаёт каждый раз.", author: "Vince Lombardi" },
    { text: "Боль временна. Сдаться — навсегда.", author: "Lance Armstrong" },
    { text: "Тренируйся так, чтобы завтра ты мог сказать, что сделал всё возможное.", author: "Мия Хамм" },
    { text: "Каждое утро ты просыпаешься с возможностью стать лучше.", author: "Неизвестный тренер" },
    { text: "Сила не приходит от физических способностей. Она приходит от несгибаемой воли.", author: "Махатма Ганди" },
    { text: "Не считай дни — делай так, чтобы каждый день считался.", author: "Мухаммед Али" },
    { text: "Победа любит подготовку.", author: "Латинская пословица" },
    { text: "Тело способно на всё. Это разум нужно убеждать.", author: "Неизвестный" },
    { text: "Успех — это сумма небольших усилий, повторяемых день за днём.", author: "Robert Collier" },
    { text: "Каждая тренировка — это инвестиция в себя.", author: "Неизвестный тренер" },
    { text: "Рекорды созданы для того, чтобы их побивать.", author: "Неизвестный" },
    { text: "Путь в тысячу миль начинается с одного шага.", author: "Лао-Цзы" },
    { text: "Не ищи причины остановиться — ищи причины продолжать.", author: "Неизвестный спортсмен" },
    { text: "Пот — это жир, плачущий от усилий.", author: "Неизвестный" },
    { text: "Единственный плохой результат — тот, который не принёс урока.", author: "Неизвестный тренер" },
];

const getDailyQuote = () => {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const day = Math.floor((new Date() - start) / 86400000);
    return QUOTES[day % QUOTES.length];
};

const SPORTS = ["Лёгкая атлетика", "Велоспорт", "Плавание", "Теннис", "Тяжёлая атлетика"];
const SPORT_ICONS = { "Лёгкая атлетика": "🏃", "Велоспорт": "🚴", "Плавание": "🏊", "Теннис": "🎾", "Тяжёлая атлетика": "🏋️" };
const SPORT_DESC = {
    "Лёгкая атлетика": "Бег, прыжки, метание — развивай скорость и выносливость",
    "Велоспорт": "Шоссе, трек, кросс-кантри — сила и техника в одном",
    "Плавание": "Все стили и дистанции — от 50м до открытой воды",
    "Теннис": "Одиночный и парный разряд — турниры и рейтинги",
    "Тяжёлая атлетика": "Рывок и толчок — максимальная сила и техника",
};

// ── Мини-календарь ────────────────────────────────────────────────────────────
const MiniCalendar = ({ trainings, onCreateTraining }) => {
    const [cur, setCur] = useState(new Date());
    const [sel, setSel] = useState(null);
    const year = cur.getFullYear(), month = cur.getMonth();
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const pad = (firstDay + 6) % 7;
    const today = new Date();

    const getForDay = d => trainings.filter(t => {
        const dt = new Date(t.trainingDate);
        return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === d;
    });

    const dotColor = ts => {
        if (!ts.length) return null;
        const now = new Date();
        if (ts.some(t => new Date(t.trainingDate) > now)) return "#f59e0b";
        if (ts.some(t => t.status === "ATTENDED" || t.status === "LATE")) return "#22c55e";
        if (ts.some(t => t.status === "ABSENT")) return "#ef4444";
        return "#2a5298";
    };

    const cells = [...Array(pad).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    const selT = sel ? getForDay(sel) : [];

    return (
        <div className="main-cal-widget">
            <div className="main-cal-header">
                <button className="main-cal-nav" onClick={() => setCur(new Date(year, month - 1, 1))}>‹</button>
                <span className="main-cal-title">{monthNames[month]} {year}</span>
                <button className="main-cal-nav" onClick={() => setCur(new Date(year, month + 1, 1))}>›</button>
            </div>
            <div className="main-cal-grid">
                {dayNames.map(d => <div key={d} className="main-cal-dayname">{d}</div>)}
                {cells.map((day, i) => {
                    if (!day) return <div key={`e${i}`} className="main-cal-cell empty" />;
                    const ts = getForDay(day);
                    const dot = dotColor(ts);
                    const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                    const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    return (
                        <div key={day}
                            className={`main-cal-cell${isToday ? ' today' : ''}${ts.length ? ' has-event' : ''}${sel === day ? ' selected' : ''}${!isPast && !ts.length && onCreateTraining ? ' clickable' : ''}`}
                            title={ts.length ? ts.map(t => t.title).join(', ') : (!isPast && onCreateTraining ? 'Создать тренировку' : '')}
                            onClick={() => {
                                if (ts.length) { setSel(sel === day ? null : day); return; }
                                if (!isPast && onCreateTraining) onCreateTraining(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T09:00`);
                            }}>
                            <span>{day}</span>
                            {dot && <span className="main-cal-dot" style={{ background: dot }} />}
                        </div>
                    );
                })}
            </div>
            {sel && selT.length > 0 && (
                <div className="main-cal-events">
                    {selT.map(t => {
                        const now = new Date(), up = new Date(t.trainingDate) > now;
                        const c = t.status === 'ATTENDED' ? '#16a34a' : t.status === 'ABSENT' ? '#dc2626' : t.status === 'LATE' ? '#ca8a04' : up ? '#d97706' : '#2563eb';
                        const bg = t.status === 'ATTENDED' ? '#f0fdf4' : t.status === 'ABSENT' ? '#fef2f2' : t.status === 'LATE' ? '#fefce8' : up ? '#fffbeb' : '#eff6ff';
                        return (
                            <div key={t.id} className="main-cal-event" style={{ borderLeftColor: c, backgroundColor: bg }}>
                                <div className="main-cal-event-title">{t.title}</div>
                                <div className="main-cal-event-meta">{new Date(t.trainingDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} · {t.durationMinutes} мин{t.location && ` · ${t.location}`}</div>
                                {t.status && <span className="main-cal-event-status" style={{ color: c, backgroundColor: `${c}18` }}>{t.status === 'ATTENDED' ? 'Присутствовал' : t.status === 'ABSENT' ? 'Не пришёл' : t.status === 'LATE' ? 'Опоздал' : up ? 'Предстоит' : 'Записан'}</span>}
                            </div>
                        );
                    })}
                </div>
            )}
            {sel && selT.length === 0 && <div className="main-cal-no-events">Нет тренировок в этот день</div>}
            <div className="main-cal-legend">
                <span><span className="main-cal-dot" style={{ background: '#22c55e' }} /> Посетил</span>
                <span><span className="main-cal-dot" style={{ background: '#ef4444' }} /> Пропустил</span>
                <span><span className="main-cal-dot" style={{ background: '#f59e0b' }} /> Предстоит</span>
                {onCreateTraining && <span style={{ color: '#94a3b8', fontSize: '10px' }}>· клик = создать</span>}
            </div>
        </div>
    );
};

// ── Модалка создания тренировки ───────────────────────────────────────────────
const CreateModal = ({ date, onClose, onDone }) => {
    const [form, setForm] = useState({ title: "", trainingDate: date || "", durationMinutes: 60, location: "", sportType: "Лёгкая атлетика", maxParticipants: 20, description: "" });
    const [loading, setLoading] = useState(false);
    const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const submit = async e => {
        e.preventDefault(); setLoading(true);
        try {
            const token = sessionStorage.getItem("accessToken");
            const r = await fetch("http://localhost:8080/api/trainings", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
            if (!r.ok) throw new Error("Ошибка");
            onDone(); onClose();
        } catch (err) { alert(err.message); } finally { setLoading(false); }
    };
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-content" style={{ maxWidth: '480px' }}>
                <div className="modal-header"><h3>Создать тренировку</h3><button className="modal-close" onClick={onClose}>✕</button></div>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
                    <div><label className="form-label">Название *</label><input className="form-input" required value={form.title} onChange={e => f('title', e.target.value)} placeholder="Название" /></div>
                    <div><label className="form-label">Дата и время *</label><input className="form-input" type="datetime-local" required value={form.trainingDate} onChange={e => f('trainingDate', e.target.value)} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div><label className="form-label">Длительность (мин)</label><input className="form-input" type="number" value={form.durationMinutes} onChange={e => f('durationMinutes', +e.target.value)} /></div>
                        <div><label className="form-label">Макс. участников</label><input className="form-input" type="number" value={form.maxParticipants} onChange={e => f('maxParticipants', +e.target.value)} /></div>
                    </div>
                    <div><label className="form-label">Вид спорта</label><select className="form-input" value={form.sportType} onChange={e => f('sportType', e.target.value)}>{SPORTS.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div><label className="form-label">Место</label><input className="form-input" value={form.location} onChange={e => f('location', e.target.value)} placeholder="Место проведения" /></div>
                    <div><label className="form-label">Описание</label><textarea className="form-input" rows="2" value={form.description} onChange={e => f('description', e.target.value)} /></div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-outline" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Создание...' : 'Создать'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Главный компонент ─────────────────────────────────────────────────────────
const MainPage = () => {
    const navigate = useNavigate();
    const { isLoggedIn, userRole, logout } = useAuth();
    const [trainings, setTrainings] = useState([]);
    const [createModal, setCreateModal] = useState(null);
    const quote = getDailyQuote();

    const loadTrainings = () => {
        if (!isLoggedIn) return;
        const url = userRole === "COACH" ? "http://localhost:8080/api/trainings/all" : "http://localhost:8080/api/trainings/my-with-status";
        const fetcher = userRole === "COACH" ? fetch(url) : fetchWithAuth(url);
        fetcher.then(r => r.ok ? r.json() : []).then(setTrainings).catch(() => { });
    };

    useEffect(() => { loadTrainings(); }, [isLoggedIn, userRole]);

    return (
        <div className="main-page">
            <header className="header">
                <div className="container">
                    <nav className="navbar">
                        <div className="logo" onClick={() => navigate("/")}><span className="logo-text">FORCE LAB</span></div>
                        <div className="nav-links">
                            <Link to="/" className="nav-link">Главная</Link>
                            <Link to="/trainings" className="nav-link">Тренировки</Link>
                            {isLoggedIn && userRole === "ATHLETE" && <><Link to="/my-trainings" className="nav-link">Мои тренировки</Link><Link to="/achievements" className="nav-link">Достижения</Link><Link to="/progress" className="nav-link">Прогресс</Link><Link to="/import" className="nav-link">Импорт</Link></>}
                            {isLoggedIn && userRole === "COACH" && <><Link to="/coach/athletes" className="nav-link">Спортсмены</Link></>}
                        </div>
                        <div className="nav-actions">
                            {isLoggedIn ? (<><button className="btn-profile" onClick={() => navigate("/profile")}>Профиль</button><button className="btn-logout" onClick={() => { logout(); navigate("/"); }}>Выйти</button></>) : (<><button className="btn-login" onClick={() => navigate("/login")}>Войти</button><button className="btn-trial" onClick={() => navigate("/register")}>Регистрация</button></>)}
                        </div>
                    </nav>
                </div>
            </header>

            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title"><span className="title-accent">FORCE LAB</span><br />современная платформа для физической подготовки<br />профессионалов и любителей спорта</h1>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '24px' }}>
                            <button className="btn-primary-large" onClick={() => navigate("/trainings")}>Начать тренировки</button>
                            {!isLoggedIn && <button className="btn-primary-large" style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.6)', color: '#fff' }} onClick={() => navigate("/register")}>Регистрация</button>}
                        </div>
                    </div>
                </div>
            </section>

            {/* Цитата дня */}
            <section className="quote-section">
                <div className="container">
                    <div className="quote-card">
                        <div className="quote-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>
                        </div>
                        <div className="quote-content">
                            <p className="quote-text">«{quote.text}»</p>
                            <p className="quote-author">— {quote.author}</p>
                        </div>
                        <div className="quote-badge">Цитата дня</div>
                    </div>
                </div>
            </section>

            {/* Виды спорта */}
            <section className="sports-section">
                <div className="container">
                    <h2 className="section-title">Виды спорта</h2>
                    <div className="sports-grid">
                        {SPORTS.map(s => (
                            <div key={s} className="sport-card" onClick={() => navigate("/trainings")}>
                                <div className="sport-icon">{SPORT_ICONS[s]}</div>
                                <h3 className="sport-name">{s}</h3>
                                <p className="sport-desc">{SPORT_DESC[s]}</p>
                                <span className="sport-link">Записаться →</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Календарь */}
            {isLoggedIn && (
                <section className="main-calendar-section">
                    <div className="container">
                        <div className="main-calendar-wrap">
                            <div className="main-calendar-left">
                                <h2 className="section-title" style={{ marginBottom: '8px' }}>{userRole === "COACH" ? "Расписание тренировок" : "Мой календарь тренировок"}</h2>
                                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>{userRole === "COACH" ? "Нажмите на свободный день чтобы создать тренировку" : "Нажмите на день чтобы увидеть тренировки"}</p>
                                <MiniCalendar trainings={trainings} onCreateTraining={userRole === "COACH" ? (d) => setCreateModal(d) : null} />
                            </div>
                            <div className="main-calendar-right">
                                <div className="main-quick-stats">
                                    <h3 className="main-quick-title">Быстрые действия</h3>
                                    {userRole === "ATHLETE" && (<>
                                        <button className="main-quick-btn" onClick={() => navigate("/trainings")}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> Записаться на тренировку</button>
                                        <button className="main-quick-btn" onClick={() => navigate("/my-trainings")}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> Мои тренировки</button>
                                        <button className="main-quick-btn" onClick={() => navigate("/progress")}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> Мой прогресс</button>
                                        <button className="main-quick-btn main-quick-btn--import" onClick={() => navigate("/import")}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> Импорт из Garmin / Strava</button>
                                        <button className="main-quick-btn" onClick={() => navigate("/achievements")}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> Достижения</button>
                                    </>)}
                                    {userRole === "COACH" && (<>
                                        <button className="main-quick-btn main-quick-btn--import" onClick={() => setCreateModal(new Date().toISOString().slice(0, 16))}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Создать тренировку</button>
                                        <button className="main-quick-btn" onClick={() => navigate("/trainings")}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> Все тренировки</button>
                                        <button className="main-quick-btn" onClick={() => navigate("/coach/athletes")}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> Мои спортсмены</button>
                                        <button className="main-quick-btn" onClick={() => navigate("/profile")}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> Мой профиль</button>
                                    </>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Features */}
            <section className="features">
                <div className="container">
                    <div className="features-grid">
                        {[
                            { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, title: "Индивидуальный подход", desc: "Программы подбираются под ваши цели и уровень подготовки" },
                            { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>, title: "Отслеживание прогресса", desc: "Ведите статистику, анализируйте результаты и улучшайте показатели" },
                            { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, title: "Профессиональные тренеры", desc: "Опытные специалисты с высшим спортивным образованием" },
                            { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>, title: "Система достижений", desc: "Получай награды за результаты и соревнуйся с другими спортсменами" },
                        ].map((f, i) => (
                            <div key={i} className="feature-item">
                                <div className="feature-icon">{f.icon}</div>
                                <h4>{f.title}</h4><p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {!isLoggedIn && (
                <section className="cta">
                    <div className="container">
                        <div className="cta-content">
                            <h2>Готов начать?</h2>
                            <p>Зарегистрируйся и начни тренироваться вместе с лучшими</p>
                            <button className="btn-cta" onClick={() => navigate("/register")}>Зарегистрироваться бесплатно</button>
                        </div>
                    </div>
                </section>
            )}

            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-info">
                            <div className="footer-logo"><span>FORCE LAB</span></div>
                            <p>Современная платформа для подготовки спортсменов любого уровня.</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-column"><h4>Навигация</h4><Link to="/trainings">Тренировки</Link><Link to="/register">Регистрация</Link><Link to="/login">Войти</Link></div>
                            <div className="footer-column"><h4>Виды спорта</h4>{SPORTS.slice(0, 4).map(s => <Link key={s} to="/trainings">{s}</Link>)}</div>
                        </div>
                    </div>
                    <div className="footer-bottom"><p>© 2026 FORCE LAB. Все права защищены.</p></div>
                </div>
            </footer>

            {createModal && <CreateModal date={createModal} onClose={() => setCreateModal(null)} onDone={() => { loadTrainings(); setCreateModal(null); }} />}
        </div>
    );
};

export default MainPage;
