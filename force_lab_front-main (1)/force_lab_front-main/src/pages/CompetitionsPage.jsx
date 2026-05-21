import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";

const SPORTS = ["Лёгкая атлетика","Велоспорт","Плавание","Теннис","Тяжёлая атлетика"];
const RESULT_TYPES = { TIME:"Время", DISTANCE:"Дистанция", POINTS:"Очки", SCORE:"Счёт" };
const TOURNAMENT_TYPES = { ROUND_ROBIN:"Круговая система", OLYMPIC:"Олимпийская система", SWISS:"Швейцарская система", CUSTOM:"Произвольная" };
const STATUS_MAP = { UPCOMING:"Предстоит", ACTIVE:"Идёт", COMPLETED:"Завершено", CANCELLED:"Отменено" };
const STATUS_COLORS = { UPCOMING:"#f59e0b", ACTIVE:"#22c55e", COMPLETED:"#2a5298", CANCELLED:"#ef4444" };

const CompetitionsPage = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { addNotification } = useNotification();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null); // детальный просмотр
  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("results"); // results | matches
  const [form, setForm] = useState({
    title:"", description:"", sportType:"Лёгкая атлетика",
    competitionDate:"", location:"", tournamentType:"ROUND_ROBIN", resultType:"TIME",
  });

  useEffect(() => { fetchCompetitions(); }, []);

  const fetchCompetitions = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch("http://localhost:8080/api/competitions", {
        headers: token ? { Authorization:`Bearer ${token}` } : {}
      });
      if (res.ok) setCompetitions(await res.json());
    } catch(e) {} finally { setLoading(false); }
  };

  const createCompetition = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch("http://localhost:8080/api/competitions", {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ошибка создания");
      addNotification("Соревнование создано!", "success");
      setShowCreate(false);
      setForm({title:"",description:"",sportType:"Лёгкая атлетика",competitionDate:"",location:"",tournamentType:"ROUND_ROBIN",resultType:"TIME"});
      fetchCompetitions();
    } catch(err) { addNotification(err.message, "error"); }
  };

  const joinCompetition = async (compId, action) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:8080/api/competitions/${compId}/${action}`, {
        method:"POST", headers:{Authorization:`Bearer ${token}`}
      });
      if (!res.ok) throw new Error(action==="accept"?"Ошибка записи":"Ошибка отказа");
      addNotification(action==="accept"?"Вы записаны на соревнование!":"Вы отказались от участия", action==="accept"?"success":"info");
      fetchCompetitions();
    } catch(err) { addNotification(err.message, "error"); }
  };

  const openDetails = async (comp) => {
    setSelected(comp);
    setActiveTab("results");
    try {
      const token = sessionStorage.getItem("accessToken");
      const headers = token ? {Authorization:`Bearer ${token}`} : {};
      const [pRes, mRes] = await Promise.all([
        fetch(`http://localhost:8080/api/competitions/${comp.id}/participants`, {headers}),
        fetch(`http://localhost:8080/api/competitions/${comp.id}/matches`, {headers}),
      ]);
      if (pRes.ok) setParticipants(await pRes.json());
      if (mRes.ok) setMatches(await mRes.json());
    } catch(e) {}
  };

  const saveResult = async (compId, athleteId, value, unit) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:8080/api/competitions/${compId}/result`, {
        method:"PUT",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify({ athleteId, resultValue: parseFloat(value), resultUnit: unit }),
      });
      if (!res.ok) throw new Error("Ошибка сохранения результата");
      addNotification("Результат сохранён!", "success");
      openDetails(selected);
    } catch(err) { addNotification(err.message, "error"); }
  };

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  if (loading) return <div className="loading">Загрузка соревнований...</div>;

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      <header className="header">
        <div className="container header-container">
          <div className="logo" onClick={()=>navigate("/")}><span className="logo-text">FORCE LAB</span></div>
          <div className="header-actions">
            <button className="btn-outline" onClick={()=>navigate("/")}>На главную</button>
            {userRole==="COACH"&&<button className="btn-primary" onClick={()=>setShowCreate(!showCreate)}>+ Соревнование</button>}
          </div>
        </div>
      </header>

      <main className="container" style={{paddingTop:'32px',paddingBottom:'40px'}}>
        <h1 className="page-title">Соревнования</h1>

        {/* Форма создания */}
        {showCreate && userRole==="COACH" && (
          <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'16px',padding:'24px',marginBottom:'24px'}}>
            <h3 style={{margin:'0 0 16px',color:'#1e293b'}}>Новое соревнование</h3>
            <form onSubmit={createCompetition}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                <div style={{gridColumn:'1/-1'}}><label className="form-label">Название *</label><input className="form-input" required value={form.title} onChange={e=>f('title',e.target.value)} placeholder="Чемпионат клуба по бегу"/></div>
                <div><label className="form-label">Вид спорта *</label><select className="form-input" value={form.sportType} onChange={e=>f('sportType',e.target.value)}>{SPORTS.map(s=><option key={s}>{s}</option>)}</select></div>
                <div><label className="form-label">Дата *</label><input className="form-input" type="datetime-local" required value={form.competitionDate} onChange={e=>f('competitionDate',e.target.value)}/></div>
                <div><label className="form-label">Формат турнира</label>
                  <select className="form-input" value={form.tournamentType} onChange={e=>f('tournamentType',e.target.value)}>
                    {Object.entries(TOURNAMENT_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Тип результата</label>
                  <select className="form-input" value={form.resultType} onChange={e=>f('resultType',e.target.value)}>
                    {Object.entries(RESULT_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Место проведения</label><input className="form-input" value={form.location} onChange={e=>f('location',e.target.value)} placeholder="Стадион"/></div>
                <div style={{gridColumn:'1/-1'}}><label className="form-label">Описание</label><textarea className="form-input" rows="2" value={form.description} onChange={e=>f('description',e.target.value)}/></div>
              </div>
              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'16px'}}>
                <button type="button" className="btn-outline" onClick={()=>setShowCreate(false)}>Отмена</button>
                <button type="submit" className="btn-primary">Создать</button>
              </div>
            </form>
          </div>
        )}

        {/* Список соревнований */}
        {competitions.length===0 ? (
          <div className="no-data"><p>Нет соревнований</p></div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'16px'}}>
            {competitions.map(comp => {
              const sc = STATUS_COLORS[comp.status]||'#64748b';
              return (
                <div key={comp.id} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'14px',padding:'20px',cursor:'pointer',transition:'all 0.15s'}}
                  onClick={()=>openDetails(comp)}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
                    <h3 style={{margin:0,fontSize:'16px',fontWeight:700,color:'#1e293b'}}>{comp.title}</h3>
                    <span style={{fontSize:'11px',fontWeight:700,padding:'3px 10px',borderRadius:'20px',backgroundColor:`${sc}18`,color:sc,whiteSpace:'nowrap',flexShrink:0,marginLeft:'8px'}}>{STATUS_MAP[comp.status]}</span>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'10px'}}>
                    <span style={{fontSize:'12px',color:'#2a5298',background:'#eff6ff',padding:'2px 8px',borderRadius:'10px'}}>{comp.sportType}</span>
                    <span style={{fontSize:'12px',color:'#64748b',background:'#f8fafc',padding:'2px 8px',borderRadius:'10px'}}>{TOURNAMENT_TYPES[comp.tournamentType]}</span>
                    <span style={{fontSize:'12px',color:'#64748b',background:'#f8fafc',padding:'2px 8px',borderRadius:'10px'}}>{RESULT_TYPES[comp.resultType]}</span>
                  </div>
                  <div style={{fontSize:'13px',color:'#64748b'}}>
                    📅 {new Date(comp.competitionDate).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}
                    {comp.location&&<><br/>📍 {comp.location}</>}
                  </div>
                  {userRole==="ATHLETE"&&comp.status==="UPCOMING"&&(
                    <div style={{display:'flex',gap:'8px',marginTop:'12px'}} onClick={e=>e.stopPropagation()}>
                      <button className="btn-action btn-action-primary" onClick={()=>joinCompetition(comp.id,"accept")}>Участвовать</button>
                      <button className="btn-action btn-action-outline" onClick={()=>joinCompetition(comp.id,"decline")}>Отказаться</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Детальный просмотр */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div style={{background:'#fff',borderRadius:'18px',width:'100%',maxWidth:'700px',maxHeight:'90vh',overflowY:'auto',padding:'28px',margin:'16px'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'}}>
              <div>
                <h2 style={{margin:'0 0 6px',color:'#1e293b'}}>{selected.title}</h2>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  <span style={{fontSize:'12px',color:'#2a5298',background:'#eff6ff',padding:'2px 8px',borderRadius:'10px'}}>{selected.sportType}</span>
                  <span style={{fontSize:'12px',color:'#64748b',background:'#f8fafc',padding:'2px 8px',borderRadius:'10px'}}>{TOURNAMENT_TYPES[selected.tournamentType]}</span>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',fontSize:'20px',color:'#94a3b8',cursor:'pointer'}}>✕</button>
            </div>

            {/* Вкладки */}
            <div style={{display:'flex',gap:'4px',borderBottom:'1px solid #e2e8f0',marginBottom:'20px'}}>
              {[{k:'results',l:'Результаты'},{k:'matches',l:'Матчи/Сетка'}].map(t=>(
                <button key={t.k} onClick={()=>setActiveTab(t.k)}
                  style={{padding:'8px 16px',border:'none',background:'none',fontSize:'14px',fontWeight:activeTab===t.k?700:400,color:activeTab===t.k?'#2a5298':'#64748b',borderBottom:activeTab===t.k?'2px solid #2a5298':'2px solid transparent',cursor:'pointer'}}>
                  {t.l}
                </button>
              ))}
            </div>

            {/* Таблица результатов */}
            {activeTab==="results"&&(
              <div>
                <h4 style={{color:'#1e293b',marginBottom:'12px'}}>Участники и результаты</h4>
                {participants.length===0?<p style={{color:'#94a3b8',textAlign:'center'}}>Нет участников</p>:(
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead>
                      <tr style={{background:'#f8fafc'}}>
                        <th style={th}>#</th>
                        <th style={th}>Спортсмен</th>
                        <th style={th}>Статус</th>
                        <th style={th}>Результат ({RESULT_TYPES[selected.resultType]})</th>
                        {userRole==="COACH"&&<th style={th}>Действие</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {participants.sort((a,b)=>(a.place||999)-(b.place||999)).map((p,i)=>(
                        <tr key={p.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                          <td style={td}>{p.place||'—'}</td>
                          <td style={td}><div style={{fontWeight:600}}>{p.fullName}</div><div style={{fontSize:'11px',color:'#94a3b8'}}>{p.sportType}</div></td>
                          <td style={td}><span style={{fontSize:'11px',padding:'2px 8px',borderRadius:'10px',background:p.status==='ACCEPTED'?'#f0fdf4':'#f8fafc',color:p.status==='ACCEPTED'?'#16a34a':'#64748b'}}>{p.status==='ACCEPTED'?'Участвует':p.status==='DECLINED'?'Отказался':'Приглашён'}</span></td>
                          <td style={td}>
                            {userRole==="COACH"?(
                              <ResultInput value={p.resultValue} unit={p.resultUnit||selected.resultType} onSave={(v,u)=>saveResult(selected.id,p.athleteId,v,u)} resultType={selected.resultType}/>
                            ):(
                              p.resultValue ? `${p.resultValue} ${p.resultUnit||''}` : '—'
                            )}
                          </td>
                          {userRole==="COACH"&&<td style={td}></td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Сетка матчей (Олимпийская система) */}
            {activeTab==="matches"&&(
              <div>
                <h4 style={{color:'#1e293b',marginBottom:'12px'}}>Сетка {selected.tournamentType==="OLYMPIC"?"(Олимпийская)":""}</h4>
                {matches.length===0?<p style={{color:'#94a3b8',textAlign:'center'}}>Матчи не назначены</p>:(
                  <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                    {[...new Set(matches.map(m=>m.round))].sort().map(round=>(
                      <div key={round}>
                        <div style={{fontSize:'12px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Раунд {round}</div>
                        {matches.filter(m=>m.round===round).map(match=>(
                          <div key={match.id} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'10px',padding:'12px 16px',display:'flex',alignItems:'center',gap:'12px',marginBottom:'6px'}}>
                            <div style={{flex:1,textAlign:'right',fontWeight:match.winnerId===match.athlete1Id?700:400,color:match.winnerId===match.athlete1Id?'#22c55e':'#1e293b'}}>{match.athlete1Name||'TBD'}</div>
                            <div style={{fontSize:'16px',fontWeight:700,color:'#1e293b',minWidth:'60px',textAlign:'center'}}>{match.score1||'—'} : {match.score2||'—'}</div>
                            <div style={{flex:1,fontWeight:match.winnerId===match.athlete2Id?700:400,color:match.winnerId===match.athlete2Id?'#22c55e':'#1e293b'}}>{match.athlete2Name||'TBD'}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ResultInput = ({ value, unit, onSave, resultType }) => {
  const [v, setV] = useState(value||"");
  const units = { TIME:"сек", DISTANCE:"м", POINTS:"очков", SCORE:"очков" };
  return (
    <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
      <input type="number" step="0.001" value={v} onChange={e=>setV(e.target.value)}
        style={{width:'80px',padding:'4px 6px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'13px'}}
        placeholder="0"/>
      <span style={{fontSize:'11px',color:'#64748b'}}>{units[resultType]||''}</span>
      <button onClick={()=>onSave(v,units[resultType]||'')}
        style={{padding:'4px 10px',borderRadius:'6px',background:'#2a5298',border:'none',color:'#fff',fontSize:'12px',cursor:'pointer'}}>
        ✓
      </button>
    </div>
  );
};

const th = {padding:'10px 14px',textAlign:'left',fontSize:'12px',fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.5px'};
const td = {padding:'10px 14px',fontSize:'13px',color:'#1e293b'};

export default CompetitionsPage;
