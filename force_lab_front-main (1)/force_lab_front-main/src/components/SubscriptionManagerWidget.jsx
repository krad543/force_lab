import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../api";

const PERIODS = [
  { value: 1, label: "1 месяц" },
  { value: 2, label: "2 месяца" },
  { value: 3, label: "3 месяца" },
  { value: 6, label: "6 месяцев" },
  { value: 12, label: "1 год" },
];

/**
 * Виджет управления подписками для тренера.
 * Подключить в CoachAthletesPage или отдельную страницу.
 */
const SubscriptionManagerWidget = ({ athletes }) => {
  const [subs, setSubs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ athleteId: "", periodMonths: 1, amount: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchWithAuth("http://localhost:8080/api/subscriptions/coach")
      .then(r => r.ok ? r.json() : [])
      .then(setSubs)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch("http://localhost:8080/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ошибка");
      const data = await res.json();
      setMsg(data.message || "Подписка оформлена!");
      setShowForm(false);
      // Обновляем список
      fetchWithAuth("http://localhost:8080/api/subscriptions/coach")
        .then(r => r.ok ? r.json() : []).then(setSubs);
    } catch (err) {
      setMsg("Ошибка: " + err.message);
    } finally { setLoading(false); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const getDaysLeft = (endDate) => {
    const diff = Math.ceil((new Date(endDate) - new Date()) / 86400000);
    return diff;
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Абонементы</h3>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: "7px 14px", borderRadius: "8px", background: "#2a5298", border: "none", color: "#fff", fontSize: "13px", cursor: "pointer" }}>
          + Оформить
        </button>
      </div>

      {msg && <div style={{ padding: "10px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", color: "#16a34a", fontSize: "13px", marginBottom: "12px" }}>{msg}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={lbl}>Спортсмен *</label>
              <select style={inp} required value={form.athleteId} onChange={e => f("athleteId", e.target.value)}>
                <option value="">Выберите спортсмена</option>
                {(athletes || []).map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Период</label>
              <select style={inp} value={form.periodMonths} onChange={e => f("periodMonths", parseInt(e.target.value))}>
                {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Стоимость (руб.)</label>
              <input style={inp} type="number" value={form.amount} onChange={e => f("amount", e.target.value)} placeholder="0"/>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={lbl}>Примечание</label>
              <input style={inp} value={form.notes} onChange={e => f("notes", e.target.value)} placeholder="Необязательно"/>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "12px" }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: "13px" }}>Отмена</button>
            <button type="submit" disabled={loading} style={{ padding: "8px 16px", borderRadius: "8px", background: "#2a5298", border: "none", color: "#fff", fontSize: "13px", cursor: "pointer" }}>{loading ? "Сохранение..." : "Оформить"}</button>
          </div>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {subs.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: "12px" }}>Нет оформленных абонементов</p>
        ) : subs.map(s => {
          const days = getDaysLeft(s.endDate);
          const isExp = days < 0;
          const isWarn = !isExp && days <= 7;
          const c = isExp ? "#ef4444" : isWarn ? "#f59e0b" : "#22c55e";
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#fff", border: `1px solid ${c}30`, borderRadius: "10px", borderLeft: `3px solid ${c}` }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>{s.athleteName}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>{s.sportType} · до {new Date(s.endDate).toLocaleDateString("ru-RU")}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: c }}>{isExp ? "Истёк" : isWarn ? `${days} дн.` : `${days} дн.`}</div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>{s.periodMonths} мес.</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const lbl = { display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" };
const inp = { width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#1e293b", outline: "none", boxSizing: "border-box" };

export default SubscriptionManagerWidget;
