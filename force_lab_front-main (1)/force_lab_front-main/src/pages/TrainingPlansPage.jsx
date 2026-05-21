import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import Icons from "../components/Icons";

import "./TrainingPlansPage.css";

const TrainingPlansPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { triggerUpdate } = useAuth();
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState("active");
  const [athleteId, setAthleteId] = useState(null);

  useEffect(() => {
    getAthleteProfile();
  }, [triggerUpdate]);

  const getAthleteProfile = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/athletes/profile"
      );
      if (response.ok) {
        const profile = await response.json();
        setAthleteId(profile.id);
        fetchPlans(profile.id);
      } else {
        throw new Error("Не удалось получить профиль");
      }
    } catch (err) {
      setError("Ошибка загрузки профиля. Пожалуйста, войдите снова.");
      setLoading(false);
    }
  };

  const fetchPlans = async (aId) => {
    try {
      const id = aId || athleteId;
      if (!id) {
        throw new Error("ID спортсмена не найден");
      }

      const response = await fetchWithAuth(
        `http://localhost:8080/api/training-plans/athlete/${id}`
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Ошибка загрузки планов");
      }

      const data = await response.json();
      setPlans(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (planId, newStatus) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/training-plans/${planId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка изменения статуса");
      }

      fetchPlans();
    } catch (err) {
      addNotification(err.message, "error");
    }
  };

  const handleCompleteItem = async (itemId, actualValue) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/training-plans/items/${itemId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            actualValue: actualValue || 0,
            notes: "",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка выполнения задания");
      }

      addNotification("Задание отмечено как выполненное!", "success");

      fetchPlans();
      if (selectedPlan) {
        const response = await fetchWithAuth(
          `http://localhost:8080/api/training-plans/${selectedPlan.id}`
        );
        if (response.ok) {
          const updatedPlan = await response.json();
          setSelectedPlan(updatedPlan);
        }
      }
    } catch (err) {
      addNotification(err.message, "error");
    }
  };

  const filteredPlans = plans.filter((plan) => {
    if (filter === "all") return true;
    return plan.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) return <div className="loading">Загрузка планов...</div>;
  if (error) return <div className="error">{error}</div>;

  if (selectedPlan) {
    return (
      <div className="training-plans-page">
        <header className="header">
          <div className="container header-container">
            <div className="logo" onClick={() => navigate("/")}>
              <span className="logo-text">FORCE LAB</span>
            </div>
            <div className="header-actions">
              <button
                className="btn-outline"
                onClick={() => setSelectedPlan(null)}
              >
                ← К списку планов
              </button>
            </div>
          </div>
        </header>

        <main className="container">
          <div className="plan-detail-header">
            <h1 className="page-title">{selectedPlan.name}</h1>
            <div className="plan-progress-overview">
              <div className="progress-circle">
                <svg viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#2a5298"
                    strokeWidth="8"
                    strokeDasharray={`${
                      selectedPlan.progressPercentage * 2.83
                    } ${283 - selectedPlan.progressPercentage * 2.83}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="progress-text">
                  {Math.round(selectedPlan.progressPercentage)}%
                </div>
              </div>
              <div className="plan-info-details">
                <p>{selectedPlan.description}</p>
                <p>
                  <Icons.Calendar className="icon-small" /> Старт:{" "}
                  {new Date(selectedPlan.startDate).toLocaleDateString("ru-RU")}
                </p>
                {selectedPlan.endDate && (
                  <p>
                    <Icons.Target className="icon-small" /> Окончание:{" "}
                    {new Date(selectedPlan.endDate).toLocaleDateString("ru-RU")}
                  </p>
                )}
                <p>
                  <Icons.User className="icon-small" /> Тренер:{" "}
                  {selectedPlan.coachName || "Не назначен"}
                </p>
                <p>
                  <Icons.Check className="icon-small" /> Выполнено:{" "}
                  {selectedPlan.completedItems}/{selectedPlan.totalItems}{" "}
                  заданий
                </p>
              </div>
            </div>
          </div>

          {/* Календарь плана */}
          <div className="plan-calendar">
            <h2 className="section-title">
              <Icons.Calendar className="icon-medium" /> Расписание тренировок
            </h2>
            <div className="plan-items">
              {selectedPlan.items?.map((item) => (
                <div
                  key={item.id}
                  className={`plan-item ${item.completed ? "completed" : ""}`}
                >
                  <div className="item-header">
                    <span className="item-day">День {item.dayNumber}</span>
                    {item.weekNumber && (
                      <span className="item-week">
                        Неделя {item.weekNumber}
                      </span>
                    )}
                    <span
                      className={`item-status ${
                        item.completed ? "done" : "pending"
                      }`}
                    >
                      {item.completed ? "✓ Выполнено" : "Ожидает"}
                    </span>
                  </div>
                  <h3 className="item-exercise">{item.exerciseName}</h3>
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                  <div className="item-details">
                    {item.setsCount && <span>{item.setsCount} подходов</span>}
                    {item.repsCount && <span>{item.repsCount} повторений</span>}
                    {item.weight && <span>{item.weight} кг</span>}
                    {item.durationMinutes && (
                      <span>{item.durationMinutes} мин</span>
                    )}
                    {item.distanceMeters && (
                      <span>{item.distanceMeters} м</span>
                    )}
                    {item.restSeconds && (
                      <span>Отдых: {item.restSeconds} сек</span>
                    )}
                  </div>
                  {item.scheduledDate && (
                    <div className="item-date">
                      <Icons.Calendar className="icon-small" />{" "}
                      {new Date(item.scheduledDate).toLocaleDateString("ru-RU")}
                    </div>
                  )}
                  {!item.completed && (
                    <button
                      className="btn-complete"
                      onClick={() =>
                        handleCompleteItem(item.id, item.weight || 0)
                      }
                    >
                      ✓ Отметить выполнение
                    </button>
                  )}
                  {item.completed && item.actualValue && (
                    <div className="item-result">
                      Фактически: {item.actualValue}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="training-plans-page">
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
              onClick={() => setShowCreateForm(true)}
            >
              + Создать план
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <h1 className="page-title">
          <Icons.Note className="page-icon" /> Планы тренировок
        </h1>

        <div className="plan-filters">
          {["active", "completed", "draft", "all"].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? "active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {status === "all"
                ? "Все"
                : status === "active"
                ? "Активные"
                : status === "completed"
                ? "Завершенные"
                : status === "draft"
                ? "Черновики"
                : status}
            </button>
          ))}
        </div>

        {filteredPlans.length === 0 ? (
          <div className="no-trainings">
            <p>У вас пока нет планов тренировок</p>
          </div>
        ) : (
          <div className="plans-grid">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="plan-card"
                onClick={() => setSelectedPlan(plan)}
                style={{ cursor: "pointer" }}
              >
                <div className="plan-card-header">
                  <h3>{plan.name}</h3>
                  <span className={`plan-status ${plan.status.toLowerCase()}`}>
                    {plan.status === "ACTIVE"
                      ? "Активный"
                      : plan.status === "COMPLETED"
                      ? "Завершен"
                      : plan.status === "DRAFT"
                      ? "Черновик"
                      : plan.status}
                  </span>
                </div>
                <p className="plan-description">{plan.description}</p>
                <div className="plan-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${plan.progressPercentage || 0}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {Math.round(plan.progressPercentage || 0)}%
                  </span>
                </div>
                <div className="plan-info">
                  <span>
                    {plan.completedItems || 0}/{plan.totalItems || 0} заданий
                  </span>
                  {plan.difficultyLevel && (
                    <span
                      className={`difficulty ${plan.difficultyLevel.toLowerCase()}`}
                    >
                      {plan.difficultyLevel === "BEGINNER"
                        ? "Начинающий"
                        : plan.difficultyLevel === "INTERMEDIATE"
                        ? "Средний"
                        : plan.difficultyLevel === "ADVANCED"
                        ? "Продвинутый"
                        : plan.difficultyLevel === "PROFESSIONAL"
                        ? "Профессионал"
                        : plan.difficultyLevel}
                    </span>
                  )}
                </div>
                {plan.sportType && (
                  <div className="plan-sport">
                    <Icons.Weight className="icon-small" /> {plan.sportType}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TrainingPlansPage;
