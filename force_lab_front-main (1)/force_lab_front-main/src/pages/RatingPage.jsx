import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SPORTS = ["Лёгкая атлетика","Велоспорт","Плавание","Теннис","Тяжёлая атлетика"];
const STATUSES = [
  { value: "BEGINNER", label: "Начинающие", color: "#22c55e", bg: "#f0fdf4" },
  { value: "MAIN",     label: "Основные",   color: "#2a5298", bg: "#eff6ff" },
  { value: "ADVANCED", label: "Продвинутые",color: "#f59e0b", bg: "#fffbeb" },
];

const SPORT_METRICS = {
  "Лёгкая атлетика": { label: "Время (сек)", type: "TIME", unit: "сек", ascending: true },
  "Велоспорт":       { label: "Дистанция (км)", type: "DISTANCE", unit: "км", ascending: false },
  "Плавание":        { label: "Время (сек)", type: "TIME", unit: "сек", ascending: true },
  "Теннис":          { label: "Очки", type: "POINTS", unit: "очков", ascending: false },
  "Тяжёлая атлетика":{ label: "Вес (кг)", type: "WEIGHT", unit: "кг", ascending: false },
};

const getMedal = (place) => {
  if (place === 1) return "🥇";
  if (place === 2) return "🥈";
  if (place === 3) return "🥉";
  return `${place}.`;
};

const RatingPage = () => {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState("Лёгкая атлетика");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [rating, setRating] = useState([]);
  const [leaders, setLeaders] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRating();
  }, [selectedSport, selectedStatus]);

  // Загружаем лидеров по всем видам и статусам при первом рендере
  useEffect(() => {
    fetchAllLeaders();
  }, []);

  const fetchRating = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sportType: selectedSport });
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      const token = sessionStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`http://localhost:8080/api/rating?${params}`, { headers });
      if (res.ok) setRating(await res.json());
      else setRating([]);
    } catch(e) { setRating([]); } finally { setLoading(false); }
  };

  const fetchAllLeaders = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("http://localhost:8080/api/rating/leaders", { headers });
      if (res.ok) setLeaders(await res.json());
    } catch(e) {}
  };

  const metric = SPORT_METRICS[selectedSport];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header className="header">
        <div className="container header-container">
          <div className="logo" onClick={() => navigate("/")}><span className="logo-text">FORCE LAB</span></div>
          <button className="btn-outline" onClick={() => navigate("/")}>На главную</button>
        </div>
      </header>

      <main className="container" style={{ paddingTop: "32px", paddingBottom: "40px" }}>
        <h1 className="page-title">🏆 Рейтинг спортсменов</h1>

        {/* Баннер лидеров */}
        {Object.keys(leaders).length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "14px" }}>
              🎉 Лидеры клуба
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "12px" }}>
              {Object.entries(leaders).map(([key, leader]) => {
                if (!leader) return null;
                const [sport, status] = key.split("_");
                const st = STATUSES.find(s => s.value === status);
                const mt = SPORT_METRICS[sport];
                if (!st || !mt) return null;
                return (
                  <div key={key} style={{
                    background: `linear-gradient(135deg, ${st.bg}, #fff)`,
                    border: `1px solid ${st.color}40`,
                    borderRadius: "14px",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}>
                    <div style={{ fontSize: "36px" }}>🥇</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: st.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3px" }}>
                        {sport} · {st.label}
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#1e293b" }}>{leader.athleteName}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {leader.bestResult} {mt.unit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Фильтры */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginRight: "8px" }}>Вид спорта:</label>
            <select style={sel} value={selectedSport} onChange={e => setSelectedSport(e.target.value)}>
              {SPORTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginRight: "8px" }}>Статус:</label>
            <select style={sel} value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="ALL">Все</option>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Показатель: {metric.label}</span>
          </div>
        </div>

        {/* Таблица рейтинга */}
        {loading ? (
          <div className="loading">Загрузка рейтинга...</div>
        ) : rating.length === 0 ? (
          <div className="no-data"><p>Нет данных для рейтинга</p></div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={th}>Место</th>
                  <th style={th}>Спортсмен</th>
                  <th style={th}>Статус</th>
                  <th style={th}>Вид спорта</th>
                  <th style={th}>{metric.label}</th>
                  <th style={th}>Тренировок</th>
                </tr>
              </thead>
              <tbody>
                {rating.map((r, i) => {
                  const st = STATUSES.find(s => s.value === r.athleteStatus);
                  const place = i + 1;
                  return (
                    <tr key={r.athleteId} style={{ borderBottom: "1px solid #f1f5f9", background: place <= 3 ? `${st?.bg||'#fff'}` : "#fff" }}>
                      <td style={{ ...td, fontSize: "18px", textAlign: "center" }}>{getMedal(place)}</td>
                      <td style={td}>
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>{r.athleteName}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{r.clubName || ""}</div>
                      </td>
                      <td style={td}>
                        {st && <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: st.bg, color: st.color, fontWeight: 600 }}>{st.label}</span>}
                      </td>
                      <td style={td}>{r.sportType}</td>
                      <td style={{ ...td, fontWeight: 700, color: "#2a5298" }}>
                        {r.bestResult ? `${r.bestResult} ${metric.unit}` : "—"}
                      </td>
                      <td style={td}>{r.trainingsCount || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

const sel = { padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#1e293b", outline: "none" };
const th = { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" };
const td = { padding: "12px 16px", fontSize: "14px", color: "#1e293b" };

export default RatingPage;
