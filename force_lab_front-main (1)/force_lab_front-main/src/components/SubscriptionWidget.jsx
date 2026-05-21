import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../api";

/**
 * Виджет напоминания об оплате для спортсмена.
 * Подключить в MyTrainingsPage или ProfilePage.
 */
const SubscriptionWidget = () => {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("http://localhost:8080/api/subscriptions/my")
      .then(r => r.ok ? r.json() : null)
      .then(setSub)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !sub) return null;

  const daysLeft = sub.daysLeft ?? 0;
  const isExpired = sub.isExpired || daysLeft < 0;
  const isWarning = !isExpired && daysLeft <= 7;

  if (!isExpired && !isWarning) return null; // скрываем если всё хорошо

  const bgColor = isExpired ? "#fef2f2" : "#fffbeb";
  const borderColor = isExpired ? "#fca5a5" : "#fcd34d";
  const textColor = isExpired ? "#dc2626" : "#d97706";
  const icon = isExpired ? "🔒" : "⚠️";

  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: "12px",
      padding: "14px 18px",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}>
      <span style={{ fontSize: "24px" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: textColor, fontSize: "14px" }}>
          {isExpired
            ? "Абонемент истёк — доступ ограничен"
            : `Абонемент истекает через ${daysLeft} ${daysLeft === 1 ? "день" : daysLeft < 5 ? "дня" : "дней"}`}
        </div>
        <div style={{ fontSize: "12px", color: textColor, opacity: 0.8, marginTop: "2px" }}>
          {isExpired
            ? "Обратитесь к тренеру для продления абонемента"
            : `Срок действия до ${new Date(sub.endDate).toLocaleDateString("ru-RU")}. Продлите вовремя.`}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionWidget;
