import React, { useState, useEffect } from "react";

/**
 * Компонент переключателя тёмной темы.
 * Добавить в шапку MainPage.jsx рядом с кнопками навигации:
 *
 * import ThemeToggle from '../components/ThemeToggle';
 * // В navbar:
 * <ThemeToggle />
 */
const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      className="theme-toggle"
      onClick={() => setDark(d => !d)}
      title={dark ? "Светлая тема" : "Тёмная тема"}
    >
      <span className="theme-toggle-icon">{dark ? "☀️" : "🌙"}</span>
      <span>{dark ? "Светлая" : "Тёмная"}</span>
    </button>
  );
};

export default ThemeToggle;
