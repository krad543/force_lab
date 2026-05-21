import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import Icons from "../components/Icons";
import "./ProgressPage.css";

const ProgressPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [userData, setUserData] = useState(null);
  const { triggerUpdate } = useAuth();
  const [newRecord, setNewRecord] = useState({
    exerciseName: "",
    recordType: "WEIGHT",
    value: "",
    unit: "kg",
    notes: "",
  });

  useEffect(() => {
    getUserData();
  }, [triggerUpdate]);

  const getUserData = () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserData(payload);

        fetchProgress(payload.userId || payload.sub);
      }
    } catch (err) {
      setError("Ошибка авторизации. Пожалуйста, войдите снова.");
      setLoading(false);
    }
  };

  const fetchProgress = async (userId) => {
    try {
      const profileResponse = await fetchWithAuth(
        `http://localhost:8080/api/athletes/profile`
      );

      let athleteId;
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        athleteId = profileData.id;
      } else {
        throw new Error("Не удалось получить профиль спортсмена");
      }

      const response = await fetchWithAuth(
        `http://localhost:8080/api/progress/stats/${athleteId}`
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Ошибка загрузки прогресса");
      }

      const data = await response.json();
      setProgressData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      const profileResponse = await fetchWithAuth(
        `http://localhost:8080/api/athletes/profile`
      );

      if (!profileResponse.ok) {
        throw new Error("Не удалось получить профиль");
      }

      const profileData = await profileResponse.json();
      const athleteId = profileData.id;

      const response = await fetchWithAuth(
        `http://localhost:8080/api/progress/records/${athleteId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exerciseName: newRecord.exerciseName,
            recordType: newRecord.recordType,
            value: parseFloat(newRecord.value),
            unit: newRecord.unit,
            notes: newRecord.notes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Ошибка добавления рекорда");
      }

      addNotification("Рекорд успешно добавлен!", "success");
      setShowAddRecord(false);
      setNewRecord({
        exerciseName: "",
        recordType: "WEIGHT",
        value: "",
        unit: "kg",
        notes: "",
      });

      fetchProgress(athleteId);
    } catch (err) {
      addNotification(err.message, "error");
    }
  };

  const getRecordTypeIcon = (type) => {
    const icons = {
      WEIGHT: <Icons.Weight className="icon" />,
      TIME: <Icons.Time className="icon" />,
      DISTANCE: <Icons.Distance className="icon" />,
      REPS: <Icons.Reps className="icon" />,
      SPEED: <Icons.Speed className="icon" />,
      FLEXIBILITY: <Icons.Runner className="icon" />,
    };
    return icons[type] || <Icons.Chart className="icon" />;
  };

  if (loading) return <div className="loading">Загрузка прогресса...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="progress-page">
      <header className="header">
        <div className="container header-container">
          <div className="logo" onClick={() => navigate("/")}>
            <span className="logo-text">FORCE LAB</span>
          </div>
          <div className="header-actions">
            <button className="btn-outline" onClick={() => navigate("/")}>
              На главную
            </button>
            <button
              className="btn-primary"
              onClick={() => setShowAddRecord(!showAddRecord)}
            >
              + Добавить рекорд
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <h1 className="page-title">
          <Icons.Chart className="page-icon" /> Прогресс
        </h1>

        {/* Статистика */}
        {progressData && (
          <>
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <Icons.Fire className="icon" />
                </div>
                <div className="stat-value">
                  {progressData.currentStreak || 0}
                </div>
                <div className="stat-label">Дней подряд</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Icons.Chart className="icon" />
                </div>
                <div className="stat-value">
                  {progressData.attendanceRate?.toFixed(1) || "0.0"}%
                </div>
                <div className="stat-label">Посещаемость</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Icons.Trophy className="icon" />
                </div>
                <div className="stat-value">
                  {progressData.totalTrainings || 0}
                </div>
                <div className="stat-label">Всего тренировок</div>
              </div>
            </div>

            {/* Форма добавления рекорда */}
            {showAddRecord && (
              <div className="add-record-form">
                <h3>Добавить новый рекорд</h3>
                <form onSubmit={handleAddRecord}>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Название упражнения *"
                      value={newRecord.exerciseName}
                      onChange={(e) =>
                        setNewRecord({
                          ...newRecord,
                          exerciseName: e.target.value,
                        })
                      }
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <select
                        value={newRecord.recordType}
                        onChange={(e) =>
                          setNewRecord({
                            ...newRecord,
                            recordType: e.target.value,
                          })
                        }
                        className="form-input"
                      >
                        <option value="WEIGHT">Вес</option>
                        <option value="TIME">Время</option>
                        <option value="DISTANCE">Дистанция</option>
                        <option value="REPS">Повторения</option>
                        <option value="SPEED">Скорость</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Значение *"
                        value={newRecord.value}
                        onChange={(e) =>
                          setNewRecord({ ...newRecord, value: e.target.value })
                        }
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <select
                        value={newRecord.unit}
                        onChange={(e) =>
                          setNewRecord({ ...newRecord, unit: e.target.value })
                        }
                        className="form-input"
                      >
                        <option value="kg">кг</option>
                        <option value="sec">сек</option>
                        <option value="meters">метры</option>
                        <option value="reps">повторений</option>
                        <option value="kmh">км/ч</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <textarea
                      placeholder="Заметки"
                      value={newRecord.notes}
                      onChange={(e) =>
                        setNewRecord({ ...newRecord, notes: e.target.value })
                      }
                      className="form-input"
                      rows="3"
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    Сохранить рекорд
                  </button>
                </form>
              </div>
            )}

            {/* Последние рекорды */}
            <div className="recent-records">
              <h2 className="section-title">Последние рекорды</h2>
              <div className="records-list">
                {progressData.recentRecords?.map((record) => (
                  <div key={record.id} className="record-item">
                    <div className="record-icon">
                      {getRecordTypeIcon(record.recordType)}
                    </div>
                    <div className="record-info">
                      <div className="record-exercise">
                        {record.exerciseName}
                      </div>
                      <div className="record-value">
                        {record.recordValue} {record.unit}
                      </div>
                      <div className="record-date">
                        {new Date(record.achievedDate).toLocaleDateString(
                          "ru-RU"
                        )}
                      </div>
                    </div>
                    {record.notes && (
                      <div className="record-notes">{record.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ProgressPage;
