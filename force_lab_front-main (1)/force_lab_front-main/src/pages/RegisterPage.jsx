import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SPORTS = ["Лёгкая атлетика", "Велоспорт", "Плавание", "Теннис", "Тяжёлая атлетика"];

const RegisterPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [step, setStep] = useState(1); // 1=роль, 2=данные
    const [role, setRole] = useState(null);
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        email: "", password: "", fullName: "", phone: "",
        sportType: "Лёгкая атлетика", clubId: "",
        // для тренера
        clubName: "", clubDescription: "",
    });

    // Загружаем клубы для спортсмена
    useEffect(() => {
        if (role === "ATHLETE") {
            fetch("http://localhost:8080/api/clubs")
                .then(r => r.ok ? r.json() : [])
                .then(setClubs)
                .catch(() => { });
        }
    }, [role]);

    const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Регистрируем пользователя
            const regBody = {
                email: form.email,
                password: form.password,
                fullName: form.fullName,
                phone: form.phone,
                role: role,
                sportType: form.sportType,
            };

            const regRes = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(regBody),
            });

            if (!regRes.ok) {
                const err = await regRes.json().catch(() => ({}));
                throw new Error(err.message || "Ошибка регистрации");
            }

            const regData = await regRes.json();
            const token = regData.accessToken || regData.token;

            // 2. Если тренер — создаём клуб
            if (role === "COACH" && form.clubName) {
                await fetch("http://localhost:8080/api/clubs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ name: form.clubName, description: form.clubDescription, sportType: form.sportType }),
                });
            }

            // 3. Если спортсмен выбрал клуб — привязываем
            if (role === "ATHLETE" && form.clubId) {
                await fetch("http://localhost:8080/api/athletes/profile/club", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ clubId: form.clubId }),
                });
            }

            login(regData);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Фильтруем клубы по виду спорта
    const filteredClubs = clubs.filter(c => !form.sportType || c.sportType === form.sportType || !c.sportType);

    return (
        <div style={s.page}>
            <div style={s.card}>
                <div style={s.logo} onClick={() => navigate("/")}>FORCE LAB</div>
                <h2 style={s.title}>Регистрация</h2>

                {/* Шаг 1 — выбор роли */}
                {step === 1 && (
                    <div>
                        <p style={s.subtitle}>Кто вы?</p>
                        <div style={s.roleGrid}>
                            <button style={{ ...s.roleCard, ...(role === "ATHLETE" ? s.roleCardActive : {}) }}
                                onClick={() => setRole("ATHLETE")}>
                                <span style={s.roleIcon}>🏃</span>
                                <span style={s.roleName}>Спортсмен</span>
                                <span style={s.roleDesc}>Записываюсь на тренировки, слежу за прогрессом</span>
                            </button>
                            <button style={{ ...s.roleCard, ...(role === "COACH" ? s.roleCardActive : {}) }}
                                onClick={() => setRole("COACH")}>
                                <span style={s.roleIcon}>👨‍🏫</span>
                                <span style={s.roleName}>Тренер</span>
                                <span style={s.roleDesc}>Веду тренировки, управляю спортсменами</span>
                            </button>
                        </div>
                        <button style={{ ...s.btn, opacity: role ? 1 : 0.5 }} disabled={!role}
                            onClick={() => setStep(2)}>
                            Продолжить →
                        </button>
                        <p style={s.loginLink}>Уже есть аккаунт? <span style={s.link} onClick={() => navigate("/login")}>Войти</span></p>
                    </div>
                )}

                {/* Шаг 2 — форма */}
                {step === 2 && (
                    <form onSubmit={handleRegister}>
                        <button type="button" style={s.back} onClick={() => setStep(1)}>← Назад</button>
                        <div style={s.roleBadge}>{role === "ATHLETE" ? "🏃 Спортсмен" : "👨‍🏫 Тренер"}</div>

                        {error && <div style={s.error}>{error}</div>}

                        <div style={s.formGroup}>
                            <label style={s.label}>Email *</label>
                            <input style={s.input} type="email" required value={form.email} onChange={e => f('email', e.target.value)} placeholder="your@email.com" />
                        </div>
                        <div style={s.formGroup}>
                            <label style={s.label}>Пароль *</label>
                            <input style={s.input} type="password" required value={form.password} onChange={e => f('password', e.target.value)} placeholder="Минимум 6 символов" />
                        </div>
                        <div style={s.formGroup}>
                            <label style={s.label}>Полное имя *</label>
                            <input style={s.input} required value={form.fullName} onChange={e => f('fullName', e.target.value)} placeholder="Иванов Иван Иванович" />
                        </div>
                        <div style={s.formGroup}>
                            <label style={s.label}>Телефон</label>
                            <input style={s.input} value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+7 (999) 999-99-99" />
                        </div>
                        <div style={s.formGroup}>
                            <label style={s.label}>Вид спорта *</label>
                            <select style={s.input} value={form.sportType} onChange={e => f('sportType', e.target.value)}>
                                {SPORTS.map(sp => <option key={sp}>{sp}</option>)}
                            </select>
                        </div>

                        {/* Для спортсмена — выбор клуба */}
                        {role === "ATHLETE" && (
                            <div style={s.formGroup}>
                                <label style={s.label}>Клуб</label>
                                <select style={s.input} value={form.clubId} onChange={e => f('clubId', e.target.value)}>
                                    <option value="">— Выбрать клуб (необязательно) —</option>
                                    {filteredClubs.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}{c.sportType ? ` (${c.sportType})` : ''}</option>
                                    ))}
                                </select>
                                {filteredClubs.length === 0 && form.sportType && (
                                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Нет клубов по виду спорта «{form.sportType}»</p>
                                )}
                            </div>
                        )}

                        {/* Для тренера — создание клуба */}
                        {role === "COACH" && (
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Создать клуб (необязательно)</p>
                                <div style={s.formGroup}>
                                    <label style={s.label}>Название клуба</label>
                                    <input style={s.input} value={form.clubName} onChange={e => f('clubName', e.target.value)} placeholder="Например: Клуб лёгкой атлетики «Старт»" />
                                </div>
                                <div style={s.formGroup}>
                                    <label style={s.label}>Описание</label>
                                    <textarea style={{ ...s.input, minHeight: '60px', resize: 'vertical' }} value={form.clubDescription} onChange={e => f('clubDescription', e.target.value)} placeholder="Кратко о клубе" />
                                </div>
                            </div>
                        )}

                        <button type="submit" style={s.btn} disabled={loading}>
                            {loading ? "Регистрация..." : "Зарегистрироваться"}
                        </button>
                        <p style={s.loginLink}>Уже есть аккаунт? <span style={s.link} onClick={() => navigate("/login")}>Войти</span></p>
                    </form>
                )}
            </div>
        </div>
    );
};

const s = {
    page: { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { background: '#fff', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '440px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
    logo: { fontSize: '20px', fontWeight: 800, color: '#1e293b', letterSpacing: '1px', textAlign: 'center', cursor: 'pointer', marginBottom: '8px' },
    title: { fontSize: '22px', fontWeight: 700, color: '#1e293b', textAlign: 'center', margin: '0 0 20px' },
    subtitle: { fontSize: '15px', color: '#64748b', textAlign: 'center', marginBottom: '16px' },
    roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
    roleCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '18px 12px', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.15s' },
    roleCardActive: { borderColor: '#2a5298', background: '#eff6ff' },
    roleIcon: { fontSize: '28px' },
    roleName: { fontSize: '14px', fontWeight: 700, color: '#1e293b' },
    roleDesc: { fontSize: '11px', color: '#64748b', textAlign: 'center', lineHeight: 1.4 },
    roleBadge: { display: 'inline-block', fontSize: '13px', fontWeight: 600, color: '#2a5298', background: '#eff6ff', padding: '4px 12px', borderRadius: '20px', marginBottom: '16px' },
    formGroup: { marginBottom: '14px' },
    label: { display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    btn: { width: '100%', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#1e3a7a,#2a5298)', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' },
    error: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '13px', marginBottom: '14px' },
    back: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '12px' },
    loginLink: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '14px' },
    link: { color: '#2a5298', fontWeight: 600, cursor: 'pointer' },
};

export default RegisterPage;
