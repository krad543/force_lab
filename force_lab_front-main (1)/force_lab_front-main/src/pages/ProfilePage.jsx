import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";
import "./ProfilePage.css";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "" });

  const { triggerUpdate, logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, [triggerUpdate]);

  const fetchProfile = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:8080/api/profile");
      if (!response.ok) throw new Error("Ошибка загрузки профиля");
      const data = await response.json();
      setProfile(data);
      setEditForm({ fullName: data.fullName || "", phone: data.phone || "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/profile",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );
      if (!response.ok) throw new Error("Ошибка обновления профиля");
      addNotification("Профиль обновлен", "success");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      addNotification(err.message, "error");
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="error">Профиль не найден</div>;

  const isCoach = profile.role === "COACH";
  const athleteInfo = profile.athleteInfo;

  return (
    <div className="profile-page">
      <header className="header">
        <div className="container header-container">
          <div className="logo" onClick={() => navigate("/")}>
            <span className="logo-text">FORCE LAB</span>
          </div>
          <div className="header-actions">
            <button className="btn-outline" onClick={() => navigate("/")}>
              На главную
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Профиль */}
        <div className="profile-header">
          <div className="profile-avatar-circle">
            {(profile.fullName || "U")[0]}
          </div>
          <div className="profile-info-header">
            <h1 className="profile-name">{profile.fullName}</h1>
            <span className="profile-role-badge">
              {isCoach ? "Тренер" : "Спортсмен"}
            </span>
          </div>
        </div>

        {/* Табы */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Информация
          </button>
          <button
            className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            Статистика
          </button>
          {!isCoach && (
            <>
              <button
                className={`tab-btn ${
                  activeTab === "progress" ? "active" : ""
                }`}
                onClick={() => setActiveTab("progress")}
              >
                Прогресс
              </button>
            </>
          )}
        </div>

        {/* Контент */}
        <div className="profile-content">
          {activeTab === "info" && (
            <div className="info-card">
              <h3>Основная информация</h3>
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>ФИО</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, fullName: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Телефон</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-actions">
                    <button className="btn-primary" onClick={handleSaveProfile}>
                      Сохранить
                    </button>
                    <button
                      className="btn-outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="info-rows">
                    <div className="info-row">
                      <div className="info-row-icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="M2 8l10 6 10-6" />
                        </svg>
                      </div>
                      <span className="info-label">Email</span>
                      <span className="info-value">{profile.email}</span>
                    </div>
                    <div className="info-row">
                      <div className="info-row-icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                        </svg>
                      </div>
                      <span className="info-label">ФИО</span>
                      <span className="info-value">{profile.fullName}</span>
                    </div>
                    <div className="info-row">
                      <div className="info-row-icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="5" y="2" width="14" height="20" rx="2" />
                          <line x1="12" y1="18" x2="12.01" y2="18" />
                        </svg>
                      </div>
                      <span className="info-label">Телефон</span>
                      <span className="info-value">
                        {profile.phone || "Не указан"}
                      </span>
                    </div>
                    <div className="info-row">
                      <div className="info-row-icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                      </div>
                      <span className="info-label">Роль</span>
                      <span className="info-value">
                        {isCoach ? "Тренер" : "Спортсмен"}
                      </span>
                    </div>
                    <div className="info-row">
                      <div className="info-row-icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <span className="info-label">Регистрация</span>
                      <span className="info-value">
                        {new Date(profile.createdAt).toLocaleDateString(
                          "ru-RU"
                        )}
                      </span>
                    </div>
                  </div>

                  {isCoach && (
                    <div className="section-block">
                      <h4>Специализации</h4>
                      <div className="specializations">
                        {profile.specializations?.map((spec, index) => (
                          <span key={index} className="specialization-tag">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {athleteInfo && (
                    <div className="section-block">
                      <h4>Спортивная информация</h4>
                      <div className="info-rows">
                        <div className="info-row">
                          <div className="info-row-icon">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                          </div>
                          <span className="info-label">Вид спорта</span>
                          <span className="info-value">
                            {athleteInfo.sportType || "Не указан"}
                          </span>
                        </div>
                        <div className="info-row">
                          <div className="info-row-icon">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </div>
                          <span className="info-label">Разряд</span>
                          <span className="info-value">
                            {athleteInfo.rank || "Не указан"}
                          </span>
                        </div>
                        <div className="info-row">
                          <div className="info-row-icon">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="12" y1="2" x2="12" y2="22" />
                              <line x1="2" y1="12" x2="22" y2="12" />
                            </svg>
                          </div>
                          <span className="info-label">Рост</span>
                          <span className="info-value">
                            {athleteInfo.heightCm
                              ? `${athleteInfo.heightCm} см`
                              : "Не указан"}
                          </span>
                        </div>
                        <div className="info-row">
                          <div className="info-row-icon">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="2" x2="12" y2="22" />
                            </svg>
                          </div>
                          <span className="info-label">Вес</span>
                          <span className="info-value">
                            {athleteInfo.weightKg
                              ? `${athleteInfo.weightKg} кг`
                              : "Не указан"}
                          </span>
                        </div>
                        <div className="info-row">
                          <div className="info-row-icon">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                          </div>
                          <span className="info-label">Мед. группа</span>
                          <span className="info-value">
                            {athleteInfo.medicalGroup || "Не указана"}
                          </span>
                        </div>
                        <div className="info-row">
                          <div className="info-row-icon">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="8" r="4" />
                              <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                            </svg>
                          </div>
                          <span className="info-label">Тренер</span>
                          <span className="info-value">
                            {athleteInfo.coachName || "Не назначен"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    className="btn-primary"
                    style={{ marginTop: "20px" }}
                    onClick={() => setIsEditing(true)}
                  >
                    Редактировать профиль
                  </button>
                </>
              )}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="stats-grid">
              {isCoach ? (
                <>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                      </svg>
                    </div>
                    <div className="stat-value">
                      {profile.stats?.totalAthletes || 0}
                    </div>
                    <div className="stat-label">Спортсменов</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div className="stat-value">
                      {profile.stats?.totalTrainings || 0}
                    </div>
                    <div className="stat-label">Тренировок</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <div className="stat-value">
                      {profile.stats?.rating || 0}
                    </div>
                    <div className="stat-label">Рейтинг</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div className="stat-value">
                      {profile.stats?.totalTrainings || 0}
                    </div>
                    <div className="stat-label">Тренировок</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <div className="stat-value">
                      {profile.stats?.totalRecords || 0}
                    </div>
                    <div className="stat-label">Рекордов</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div className="stat-value">
                      {profile.stats?.achievements || 0}
                    </div>
                    <div className="stat-label">Достижений</div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "achievements" && !isCoach && (
            <div className="info-card">
              <h3>Достижения</h3>
              <p>Перейдите на страницу достижений для просмотра</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/achievements")}
              >
                Смотреть достижения
              </button>
            </div>
          )}

          {activeTab === "progress" && !isCoach && (
            <div className="info-card">
              <h3>Прогресс</h3>
              <p>Перейдите на страницу прогресса для просмотра</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/progress")}
              >
                Смотреть прогресс
              </button>
            </div>
          )}

          {activeTab === "plans" && !isCoach && (
            <div className="info-card">
              <h3>Планы тренировок</h3>
              <p>Перейдите на страницу планов для просмотра</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/training-plans")}
              >
                Смотреть планы
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
