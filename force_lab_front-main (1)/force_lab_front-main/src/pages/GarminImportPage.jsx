import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";
import { useNotification } from "../components/Notification";

const SOURCES = [
  {
    id: "garmin",
    name: "Garmin Connect",
    color: "#007CC3",
    logo: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#007CC3" strokeWidth="2"/>
        <path d="M8 12a4 4 0 0 1 8 0" stroke="#007CC3" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="2" fill="#007CC3"/>
        <path d="M12 6v2M12 16v2M6 12H4M20 12h-2" stroke="#007CC3" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "strava",
    name: "Strava",
    color: "#FC4C02",
    logo: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M10 3L6 13h4l-2 8 8-11h-5l3-7z" stroke="#FC4C02" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "polar",
    name: "Polar Flow",
    color: "#D10000",
    logo: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#D10000" strokeWidth="2"/>
        <path d="M8 12h8M12 8l4 4-4 4" stroke="#D10000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const ACTIVITY_TYPES = [
  "Бег", "Велосипед", "Плавание", "Триатлон", "Ходьба",
  "Лыжи", "Силовая тренировка", "ОФП", "Другое"
];

const initialForm = {
  activityType: "Бег",
  activityDate: new Date().toISOString().slice(0, 16),
  durationSeconds: "",
  distanceMeters: "",
  avgHeartRate: "",
  maxHeartRate: "",
  avgPacePerKm: "",
  calories: "",
  cadence: "",
  elevationGain: "",
  vo2max: "",
  notes: "",
};

const GarminImportPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [selectedSource, setSelectedSource] = useState(null);
  const [step, setStep] = useState(1); // 1=выбор источника, 2=форма, 3=успех
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [importedActivity, setImportedActivity] = useState(null);

  const handleSourceSelect = (source) => {
    setSelectedSource(source);
    // Имитируем "загрузку" данных из сервиса
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1200);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
  };

  const handleImport = async () => {
    if (!form.activityType) { addNotification("Выберите тип активности", "error"); return; }
    if (!form.durationSeconds) { addNotification("Укажите длительность", "error"); return; }

    setLoading(true);
    try {
      // Сохраняем как личные рекорды в существующий API
      const token = sessionStorage.getItem("accessToken");
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const saved = [];

      if (form.distanceMeters) {
        const res = await fetch("http://localhost:8080/api/progress/records", {
          method: "POST", headers,
          body: JSON.stringify({
            exerciseName: `${form.activityType} (${selectedSource?.name||"Импорт"})`,
            recordType: "DISTANCE",
            value: parseFloat((form.distanceMeters/1000).toFixed(2)),
            recordedAt: form.activityDate,
          })
        });
        if (res.ok) saved.push("дистанция");
      }

      if (form.durationSeconds) {
        const res = await fetch("http://localhost:8080/api/progress/records", {
          method: "POST", headers,
          body: JSON.stringify({
            exerciseName: `${form.activityType} (${selectedSource?.name||"Импорт"})`,
            recordType: "TIME",
            value: parseInt(form.durationSeconds),
            recordedAt: form.activityDate,
          })
        });
        if (res.ok) saved.push("время");
      }

      if (form.avgHeartRate) {
        const res = await fetch("http://localhost:8080/api/progress/records", {
          method: "POST", headers,
          body: JSON.stringify({
            exerciseName: `Пульс — ${form.activityType} (${selectedSource?.name||"Импорт"})`,
            recordType: "REPS",
            value: parseInt(form.avgHeartRate),
            recordedAt: form.activityDate,
          })
        });
        if (res.ok) saved.push("пульс");
      }

      setImportedActivity({ ...form, sourceName: selectedSource?.name });
      setStep(3);
      addNotification(`Активность импортирована! Сохранено: ${saved.join(", ")}`, "success");
    } catch (err) {
      addNotification("Ошибка импорта: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo} onClick={() => navigate("/")}>FORCE LAB</div>
          <div style={s.headerActions}>
            <button style={s.btnOutline} onClick={() => navigate("/progress")}>← Прогресс</button>
          </div>
        </div>
      </header>

      <main style={s.main}>
        {/* Шаг 1 — выбор источника */}
        {step === 1 && (
          <div style={s.stepWrap}>
            <div style={s.stepBadge}>Шаг 1 из 2</div>
            <h1 style={s.title}>Импорт активности</h1>
            <p style={s.subtitle}>Выберите сервис из которого хотите импортировать тренировку</p>

            {loading && (
              <div style={s.loadingBox}>
                <div style={s.spinner}/>
                <p style={{color:'#64748b',marginTop:'12px'}}>Подключение к {selectedSource?.name}...</p>
              </div>
            )}

            {!loading && (
              <>
                <div style={s.sourceGrid}>
                  {SOURCES.map(src => (
                    <button key={src.id} style={{...s.sourceCard, borderColor: selectedSource?.id===src.id ? src.color : '#e2e8f0'}}
                      onClick={() => handleSourceSelect(src)}>
                      <div style={{...s.sourceLogo, borderColor: `${src.color}30`, backgroundColor: `${src.color}10`}}>
                        {src.logo}
                      </div>
                      <div style={s.sourceName}>{src.name}</div>
                      <div style={s.sourceStatus}>
                        <span style={{...s.statusDot, backgroundColor: '#22c55e'}}/>
                        Подключено
                      </div>
                    </button>
                  ))}
                </div>

                <div style={s.divider}>
                  <span style={s.dividerText}>или</span>
                </div>

                <button style={s.manualBtn} onClick={() => { setSelectedSource({id:'manual',name:'Ручной ввод'}); setStep(2); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Ввести вручную
                </button>
              </>
            )}
          </div>
        )}

        {/* Шаг 2 — форма активности */}
        {step === 2 && (
          <div style={s.stepWrap}>
            <div style={s.stepBadge}>Шаг 2 из 2</div>
            <div style={s.sourceTagRow}>
              {selectedSource && selectedSource.id !== 'manual' && (
                <span style={{...s.sourceTag, color: SOURCES.find(x=>x.id===selectedSource.id)?.color||'#2a5298'}}>
                  {SOURCES.find(x=>x.id===selectedSource.id)?.logo}
                  {selectedSource.name}
                </span>
              )}
            </div>
            <h1 style={s.title}>Данные тренировки</h1>
            <p style={s.subtitle}>Проверьте и дополните данные перед импортом</p>

            <div style={s.formGrid}>
              {/* Тип и дата */}
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Тип активности</label>
                  <select style={s.input} value={form.activityType} onChange={e=>f('activityType',e.target.value)}>
                    {ACTIVITY_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Дата и время</label>
                  <input style={s.input} type="datetime-local" value={form.activityDate} onChange={e=>f('activityDate',e.target.value)}/>
                </div>
              </div>

              {/* Длительность и дистанция */}
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Длительность (секунды) *</label>
                  <input style={s.input} type="number" placeholder="например 3600 = 1 час"
                    value={form.durationSeconds} onChange={e=>f('durationSeconds',e.target.value)}/>
                  {form.durationSeconds && <span style={s.hint}>{formatDuration(parseInt(form.durationSeconds))}</span>}
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Дистанция (метры)</label>
                  <input style={s.input} type="number" placeholder="например 10000 = 10 км"
                    value={form.distanceMeters} onChange={e=>f('distanceMeters',e.target.value)}/>
                  {form.distanceMeters && <span style={s.hint}>{(form.distanceMeters/1000).toFixed(2)} км</span>}
                </div>
              </div>

              {/* Пульс */}
              <div style={s.sectionTitle}>Пульс</div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Средний пульс (уд/мин)</label>
                  <input style={s.input} type="number" placeholder="145"
                    value={form.avgHeartRate} onChange={e=>f('avgHeartRate',e.target.value)}/>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Максимальный пульс</label>
                  <input style={s.input} type="number" placeholder="178"
                    value={form.maxHeartRate} onChange={e=>f('maxHeartRate',e.target.value)}/>
                </div>
              </div>

              {/* Дополнительно */}
              <div style={s.sectionTitle}>Дополнительно</div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Темп (мин/км)</label>
                  <input style={s.input} type="text" placeholder="5:30"
                    value={form.avgPacePerKm} onChange={e=>f('avgPacePerKm',e.target.value)}/>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Каденс (шаг/мин)</label>
                  <input style={s.input} type="number" placeholder="172"
                    value={form.cadence} onChange={e=>f('cadence',e.target.value)}/>
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Калории (ккал)</label>
                  <input style={s.input} type="number" placeholder="450"
                    value={form.calories} onChange={e=>f('calories',e.target.value)}/>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Набор высоты (м)</label>
                  <input style={s.input} type="number" placeholder="120"
                    value={form.elevationGain} onChange={e=>f('elevationGain',e.target.value)}/>
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>VO2 Max</label>
                  <input style={s.input} type="number" placeholder="52"
                    value={form.vo2max} onChange={e=>f('vo2max',e.target.value)}/>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Заметки</label>
                  <input style={s.input} type="text" placeholder="Комментарий к тренировке"
                    value={form.notes} onChange={e=>f('notes',e.target.value)}/>
                </div>
              </div>
            </div>

            <div style={s.btnRow}>
              <button style={s.btnBack} onClick={() => setStep(1)}>← Назад</button>
              <button style={{...s.btnImport, opacity: loading?0.7:1}}
                onClick={handleImport} disabled={loading}>
                {loading ? "Импортируем..." : "Импортировать в FORCE LAB"}
              </button>
            </div>
          </div>
        )}

        {/* Шаг 3 — успех */}
        {step === 3 && importedActivity && (
          <div style={{...s.stepWrap, textAlign:'center'}}>
            <div style={s.successIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1 style={{...s.title, color:'#16a34a'}}>Активность импортирована!</h1>
            <p style={s.subtitle}>Данные сохранены в разделе «Прогресс»</p>

            <div style={s.summaryCard}>
              <div style={s.summaryTitle}>{importedActivity.activityType}</div>
              {importedActivity.sourceName && (
                <div style={s.summarySource}>Источник: {importedActivity.sourceName}</div>
              )}
              <div style={s.summaryGrid}>
                {importedActivity.durationSeconds && (
                  <div style={s.summaryItem}>
                    <div style={s.summaryLabel}>Время</div>
                    <div style={s.summaryValue}>{formatDuration(parseInt(importedActivity.durationSeconds))}</div>
                  </div>
                )}
                {importedActivity.distanceMeters && (
                  <div style={s.summaryItem}>
                    <div style={s.summaryLabel}>Дистанция</div>
                    <div style={s.summaryValue}>{(importedActivity.distanceMeters/1000).toFixed(2)} км</div>
                  </div>
                )}
                {importedActivity.avgHeartRate && (
                  <div style={s.summaryItem}>
                    <div style={s.summaryLabel}>Ср. пульс</div>
                    <div style={s.summaryValue}>{importedActivity.avgHeartRate} уд/мин</div>
                  </div>
                )}
                {importedActivity.calories && (
                  <div style={s.summaryItem}>
                    <div style={s.summaryLabel}>Калории</div>
                    <div style={s.summaryValue}>{importedActivity.calories} ккал</div>
                  </div>
                )}
                {importedActivity.avgPacePerKm && (
                  <div style={s.summaryItem}>
                    <div style={s.summaryLabel}>Темп</div>
                    <div style={s.summaryValue}>{importedActivity.avgPacePerKm} мин/км</div>
                  </div>
                )}
                {importedActivity.vo2max && (
                  <div style={s.summaryItem}>
                    <div style={s.summaryLabel}>VO2 Max</div>
                    <div style={s.summaryValue}>{importedActivity.vo2max}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={s.btnRow}>
              <button style={s.btnBack} onClick={() => { setStep(1); setForm(initialForm); setSelectedSource(null); }}>
                Импортировать ещё
              </button>
              <button style={s.btnImport} onClick={() => navigate("/progress")}>
                Перейти в Прогресс →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ── Стили ────────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight:'100vh', backgroundColor:'#f8fafc', fontFamily:'inherit' },
  header: { backgroundColor:'#fff', borderBottom:'1px solid #e2e8f0', padding:'0 24px' },
  headerInner: { maxWidth:'900px', margin:'0 auto', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo: { fontSize:'18px', fontWeight:800, color:'#1e293b', cursor:'pointer', letterSpacing:'1px' },
  headerActions: { display:'flex', gap:'10px' },
  btnOutline: { padding:'8px 16px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'#fff', color:'#475569', cursor:'pointer', fontSize:'14px' },
  main: { maxWidth:'700px', margin:'0 auto', padding:'40px 24px' },
  stepWrap: { display:'flex', flexDirection:'column', gap:'20px' },
  stepBadge: { display:'inline-block', fontSize:'12px', fontWeight:600, color:'#2a5298', backgroundColor:'#eff6ff', padding:'4px 12px', borderRadius:'20px', width:'fit-content' },
  title: { fontSize:'26px', fontWeight:800, color:'#1e293b', margin:0 },
  subtitle: { fontSize:'15px', color:'#64748b', margin:0 },
  sourceGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' },
  sourceCard: { display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', padding:'20px 16px', borderRadius:'14px', border:'2px solid', backgroundColor:'#fff', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  sourceLogo: { width:'56px', height:'56px', borderRadius:'14px', border:'1px solid', display:'flex', alignItems:'center', justifyContent:'center' },
  sourceName: { fontSize:'13px', fontWeight:700, color:'#1e293b' },
  sourceStatus: { display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'#64748b' },
  statusDot: { width:'7px', height:'7px', borderRadius:'50%', display:'inline-block' },
  divider: { display:'flex', alignItems:'center', gap:'12px' },
  dividerText: { fontSize:'13px', color:'#94a3b8', whiteSpace:'nowrap' },
  manualBtn: { display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'12px', borderRadius:'10px', border:'1px dashed #cbd5e1', background:'transparent', color:'#64748b', cursor:'pointer', fontSize:'14px', fontWeight:500 },
  loadingBox: { display:'flex', flexDirection:'column', alignItems:'center', padding:'40px' },
  spinner: { width:'36px', height:'36px', border:'3px solid #e2e8f0', borderTopColor:'#2a5298', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  sourceTagRow: { display:'flex', alignItems:'center', gap:'8px' },
  sourceTag: { display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', fontWeight:600, padding:'4px 12px', borderRadius:'20px', backgroundColor:'#f8fafc', border:'1px solid #e2e8f0' },
  formGrid: { display:'flex', flexDirection:'column', gap:'16px' },
  formRow: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' },
  formGroup: { display:'flex', flexDirection:'column', gap:'6px' },
  label: { fontSize:'12px', fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.5px' },
  input: { padding:'10px 12px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'14px', color:'#1e293b', outline:'none', backgroundColor:'#fff' },
  hint: { fontSize:'11px', color:'#2a5298', fontWeight:600 },
  sectionTitle: { fontSize:'12px', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', paddingTop:'8px', borderTop:'1px solid #f1f5f9' },
  btnRow: { display:'flex', gap:'12px', justifyContent:'flex-end', paddingTop:'8px' },
  btnBack: { padding:'10px 20px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'#fff', color:'#475569', cursor:'pointer', fontSize:'14px' },
  btnImport: { padding:'10px 24px', borderRadius:'8px', background:'linear-gradient(135deg,#1e3a7a,#2a5298)', border:'none', color:'#fff', fontSize:'14px', fontWeight:600, cursor:'pointer' },
  successIcon: { display:'flex', justifyContent:'center', padding:'20px 0 8px' },
  summaryCard: { backgroundColor:'#fff', border:'1px solid #e2e8f0', borderRadius:'14px', padding:'20px', textAlign:'left' },
  summaryTitle: { fontSize:'18px', fontWeight:700, color:'#1e293b', marginBottom:'4px' },
  summarySource: { fontSize:'13px', color:'#64748b', marginBottom:'16px' },
  summaryGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' },
  summaryItem: { display:'flex', flexDirection:'column', gap:'4px' },
  summaryLabel: { fontSize:'11px', color:'#94a3b8', fontWeight:600, textTransform:'uppercase' },
  summaryValue: { fontSize:'16px', fontWeight:700, color:'#1e293b' },
};

// Добавляем анимацию спиннера
const style = document.createElement('style');
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
if (!document.head.querySelector('[data-spin]')) {
  style.setAttribute('data-spin','1');
  document.head.appendChild(style);
}

export default GarminImportPage;
