import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";
import { useNotification } from "../components/Notification";

const STATUS_OPTIONS = [
    { value: "BEGINNER", label: "Начинающий", color: "#22c55e", bg: "#f0fdf4" },
    { value: "MAIN", label: "Основной", color: "#2a5298", bg: "#eff6ff" },
    { value: "ADVANCED", label: "Продвинутый", color: "#f59e0b", bg: "#fffbeb" },
];

const getStatus = (s) => STATUS_OPTIONS.find(x => x.value === s) || STATUS_OPTIONS[0];

const CoachAthletesPage = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [plans, setPlans] = useState([]);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterSport, setFilterSport] = useState("ALL");

    useEffect(() => { fetchAthletes(); }, []);

    const fetchAthletes = async () => {
        try {
            const res = await fetchWithAuth("http://localhost:8080/api/coach/athletes");
            if (res.ok) { const d = await res.json(); setAthletes(d); }
        } catch (e) { } finally { setLoading(false); }
    };

    const updateStatus = async (athleteId, status) => {
        try {
            const token = sessionStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8080/api/athletes/${athleteId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Ошибка обновления статуса");
            addNotification(`Статус обновлён: ${getStatus(status).label}`, "success");
            setShowStatusModal(false);
            fetchAthletes();
        } catch (err) { addNotification(err.message, "error"); }
    };

    const assignPlan = async (athleteId, planId) => {
        try {
            const res = await fetchWithAuth(`http://localhost:8080/api/training-plans/${planId}/assign/${athleteId}`, { method: "POST" });
            if (!res.ok) throw new Error("Ошибка назначения плана");
            addNotification("План назначен!", "success");
            setShowPlanModal(false);
        } catch (err) { addNotification(err.message, "error"); }
    };

    const fetchPlans = async () => {
        try {
            const res = await fetchWithAuth("http://localhost:8080/api/training-plans");
            if (res.ok) { const d = await res.json(); setPlans(d); }
        } catch (e) { }
    };

    const openPlanModal = (athlete) => {
        setSelectedAthlete(athlete);
        fetchPlans();
        setShowPlanModal(true);
    };

    const sports = ["ALL", ...new Set(athletes.map(a => a.sportType).filter(Boolean))];

    const filtered = athletes.filter(a => {
        if (filterStatus !== "ALL" && a.athleteStatus !== filterStatus) return false;
        if (filterSport !== "ALL" && a.sportType !== filterSport) return false;
        return true;
    });

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="coach-athletes-page">
            <header className="header">
                <div className="container header-container">
                    <div className="logo" onClick={() => navigate("/")}><span className="logo-text">FORCE LAB</span></div>
                    <div className="header-actions">
                        <button className="btn-outline" onClick={() => navigate("/")}>На главную</button>
                        <button className="btn-primary" onClick={() => navigate("/trainings")}>Тренировки</button>
                    </div>
                </div>
            </header>

            <main className="container">
                <h1 className="page-title">Мои спортсмены</h1>

                {/* Фильтры */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
                    <div>
                        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginRight: '8px' }}>Статус:</label>
                        <select style={selStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="ALL">Все</option>
                            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginRight: '8px' }}>Вид спорта:</label>
                        <select style={selStyle} value={filterSport} onChange={e => setFilterSport(e.target.value)}>
                            {sports.map(s => <option key={s} value={s}>{s === "ALL" ? "Все" : s}</option>)}
                        </select>
                    </div>
                    <span style={{ fontSize: '13px', color: '#94a3b8', marginLeft: 'auto' }}>Всего: {filtered.length}</span>
                </div>

                {/* Статистика по статусам */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
                    {STATUS_OPTIONS.map(st => {
                        const count = athletes.filter(a => a.athleteStatus === st.value).length;
                        return (
                            <div key={st.value} style={{ background: st.bg, border: `1px solid ${st.color}30`, borderRadius: '10px', padding: '14px', textAlign: 'center', cursor: 'pointer' }}
                                onClick={() => setFilterStatus(filterStatus === st.value ? "ALL" : st.value)}>
                                <div style={{ fontSize: '22px', fontWeight: 800, color: st.color }}>{count}</div>
                                <div style={{ fontSize: '12px', color: st.color, fontWeight: 600 }}>{st.label}</div>
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 ? (
                    <div className="no-data"><p>Нет спортсменов</p></div>
                ) : (
                    <div className="athletes-grid">
                        {filtered.map(athlete => {
                            const st = getStatus(athlete.athleteStatus);
                            return (
                                <div key={athlete.id} className="athlete-card">
                                    <div className="athlete-card-top">
                                        <div className="athlete-avatar">{(athlete.fullName || "С")[0]}</div>
                                        <div className="athlete-info">
                                            <h3 className="athlete-name">{athlete.fullName || "Без имени"}</h3>
                                            <p className="athlete-email">{athlete.email}</p>
                                        </div>
                                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', backgroundColor: st.bg, color: st.color, border: `1px solid ${st.color}40`, whiteSpace: 'nowrap' }}>
                                            {st.label}
                                        </span>
                                    </div>
                                    <div className="athlete-card-body">
                                        <div className="athlete-detail"><span>Вид спорта:</span><span>{athlete.sportType || "Не указан"}</span></div>
                                        <div className="athlete-detail"><span>Разряд:</span><span>{athlete.rank || "Не указан"}</span></div>
                                        {athlete.clubName && <div className="athlete-detail"><span>Клуб:</span><span>{athlete.clubName}</span></div>}
                                        <div className="athlete-detail">
                                            <span>Статус:</span>
                                            <span style={{ color: athlete.active !== false ? '#22c55e' : '#ef4444' }}>{athlete.active !== false ? "Активен" : "Неактивен"}</span>
                                        </div>
                                    </div>
                                    <div className="athlete-card-actions">
                                        <button className="btn-action btn-action-outline"
                                            onClick={() => { setSelectedAthlete(athlete); setShowStatusModal(true); }}>
                                            Статус
                                        </button>
                                        <button className="btn-action btn-action-outline" onClick={() => openPlanModal(athlete)}>
                                            Назначить план
                                        </button>
                                        <button className="btn-action btn-action-primary" onClick={() => navigate(`/coach/athletes/${athlete.id}`)}>
                                            Профиль
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Модалка статуса */}
            {showStatusModal && selectedAthlete && (
                <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '360px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Статус спортсмена</h3>
                            <button className="modal-close" onClick={() => setShowStatusModal(false)}>✕</button>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>{selectedAthlete.fullName}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {STATUS_OPTIONS.map(st => (
                                <button key={st.value}
                                    style={{ padding: '12px 16px', borderRadius: '10px', border: `2px solid ${selectedAthlete.athleteStatus === st.value ? st.color : '#e2e8f0'}`, background: selectedAthlete.athleteStatus === st.value ? st.bg : '#fff', color: st.color, fontWeight: 600, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                    onClick={() => updateStatus(selectedAthlete.id, st.value)}>
                                    {st.label}
                                    {selectedAthlete.athleteStatus === st.value && <span>✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка планов */}
            {showPlanModal && selectedAthlete && (
                <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Назначить план</h3>
                            <button className="modal-close" onClick={() => setShowPlanModal(false)}>✕</button>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>{selectedAthlete.fullName}</p>
                        {plans.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>Нет планов</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {plans.map(p => (
                                    <button key={p.id} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', textAlign: 'left', fontSize: '14px', color: '#1e293b' }}
                                        onClick={() => assignPlan(selectedAthlete.id, p.id)}>
                                        <div style={{ fontWeight: 600 }}>{p.title}</div>
                                        {p.description && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{p.description}</div>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const selStyle = { padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#1e293b', outline: 'none' };

export default CoachAthletesPage;
