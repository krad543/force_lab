import React from "react";

/**
 * Skeleton-карточка для загрузки тренировок.
 *
 * Использование в TrainingsPage.jsx:
 *
 * import SkeletonCard from '../components/SkeletonCard';
 *
 * // Вместо спиннера:
 * if (loading) return (
 *   <div className="trainings-grid">
 *     {Array.from({length:6}).map((_,i) => <SkeletonCard key={i}/>)}
 *   </div>
 * );
 */
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-badge" />
    </div>
    <div className="skeleton skeleton-line" style={{ width: "55%" }} />
    <div className="skeleton skeleton-line" style={{ width: "40%" }} />
    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
      <div className="skeleton skeleton-avatar" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center" }}>
        <div className="skeleton skeleton-line-sm" style={{ width: "60%" }} />
        <div className="skeleton skeleton-line-sm" style={{ width: "40%" }} />
      </div>
    </div>
    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
      <div className="skeleton skeleton-line" style={{ flex: 1, height: "32px", borderRadius: "8px" }} />
      <div className="skeleton skeleton-line" style={{ flex: 1, height: "32px", borderRadius: "8px" }} />
    </div>
  </div>
);

export default SkeletonCard;
