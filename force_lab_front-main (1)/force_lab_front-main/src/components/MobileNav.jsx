import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

/**
 * Мобильная навигация с бургер-меню.
 * Заменяет <header> в MainPage.jsx.
 *
 * import MobileNav from '../components/MobileNav';
 * // В return:
 * <MobileNav />
 */
const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, userRole, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Закрываем меню при смене страницы
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const athleteLinks = [
    { to: "/", label: "Главная" },
    { to: "/trainings", label: "Тренировки" },
    { to: "/my-trainings", label: "Мои тренировки" },
    { to: "/achievements", label: "Достижения" },
    { to: "/progress", label: "Прогресс" },
    { to: "/import", label: "Импорт" },
    { to: "/competitions", label: "Соревнования" },
    { to: "/rating", label: "Рейтинг" },
  ];

  const coachLinks = [
    { to: "/", label: "Главная" },
    { to: "/trainings", label: "Тренировки" },
    { to: "/coach/athletes", label: "Спортсмены" },
    { to: "/competitions", label: "Соревнования" },
    { to: "/rating", label: "Рейтинг" },
  ];

  const guestLinks = [
    { to: "/", label: "Главная" },
    { to: "/trainings", label: "Тренировки" },
    { to: "/rating", label: "Рейтинг" },
  ];

  const links = isLoggedIn
    ? (userRole === "COACH" ? coachLinks : athleteLinks)
    : guestLinks;

  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <span className="logo-text">FORCE LAB</span>
          </div>

          {/* Desktop links */}
          <div className="nav-links">
            {links.map(l => (
              <Link key={l.to} to={l.to} className="nav-link"
                style={{ fontWeight: location.pathname === l.to ? 700 : 400, color: location.pathname === l.to ? "var(--accent)" : undefined }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ThemeToggle />
            {isLoggedIn ? (
              <>
                <button className="btn-profile" onClick={() => navigate("/profile")}>Профиль</button>
                <button className="btn-logout" onClick={() => { logout(); navigate("/"); }}>Выйти</button>
              </>
            ) : (
              <>
                <button className="btn-login" onClick={() => navigate("/login")}>Войти</button>
                <button className="btn-trial" onClick={() => navigate("/register")}>Регистрация</button>
              </>
            )}
          </div>

          {/* Burger button (mobile) */}
          <button className={`burger-btn${open ? " open" : ""}`} onClick={() => setOpen(o => !o)} aria-label="Меню">
            <span /><span /><span />
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu${open ? " open" : ""}`}>
        {links.map(l => (
          <Link key={l.to} to={l.to} className="nav-link"
            style={{ padding: "12px 24px", borderBottom: "1px solid var(--border)", display: "block", fontWeight: location.pathname === l.to ? 700 : 400 }}>
            {l.label}
          </Link>
        ))}
        <div style={{ padding: "12px 24px", display: "flex", gap: "10px", flexWrap: "wrap", borderBottom: "1px solid var(--border)" }}>
          <ThemeToggle />
        </div>
        {isLoggedIn ? (
          <div style={{ padding: "12px 24px", display: "flex", gap: "8px" }}>
            <button className="btn-profile" onClick={() => navigate("/profile")} style={{ flex: 1 }}>Профиль</button>
            <button className="btn-logout" onClick={() => { logout(); navigate("/"); }} style={{ flex: 1 }}>Выйти</button>
          </div>
        ) : (
          <div style={{ padding: "12px 24px", display: "flex", gap: "8px" }}>
            <button className="btn-login" onClick={() => navigate("/login")} style={{ flex: 1 }}>Войти</button>
            <button className="btn-trial" onClick={() => navigate("/register")} style={{ flex: 1 }}>Регистрация</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default MobileNav;
