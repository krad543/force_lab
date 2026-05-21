/**
 * Добавить в src/App.jsx
 * 
 * 1. Импорты новых страниц:
 */
import CompetitionsPage from './pages/CompetitionsPage';
import RatingPage from './pages/RatingPage';
import GarminImportPage from './pages/GarminImportPage';

/**
 * 2. В Routes добавить новые маршруты:
 * 
 * <Route path="/competitions" element={<CompetitionsPage />} />
 * <Route path="/rating" element={<RatingPage />} />
 * <Route path="/import" element={<GarminImportPage />} />
 * 
 * 
 * 3. В src/index.css или src/App.css добавить В НАЧАЛО файла:
 *    (вставить содержимое theme.css)
 * 
 * 
 * 4. Во всех страницах заменить <header> на <MobileNav/>:
 * 
 * import MobileNav from '../components/MobileNav';
 * // удалить <header>...</header> и вставить:
 * <MobileNav />
 * 
 * 
 * 5. В TrainingsPage.jsx и MyTrainingsPage.jsx заменить спиннер:
 * 
 * import SkeletonCard from '../components/SkeletonCard';
 * 
 * // Было:
 * if (loading) return <div className="loading">Загрузка...</div>;
 * 
 * // Стало:
 * if (loading) return (
 *   <div>
 *     <MobileNav />
 *     <main className="container" style={{paddingTop:'32px'}}>
 *       <div className="trainings-grid">
 *         {Array.from({length:6}).map((_,i) => <SkeletonCard key={i}/>)}
 *       </div>
 *     </main>
 *   </div>
 * );
 */

// Пример полного App.jsx после всех изменений:
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './components/Notification';

import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TrainingsPage from './pages/TrainingsPage';
import MyTrainingsPage from './pages/MyTrainingsPage';
import AchievementsPage from './pages/AchievementsPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import TrainingPlansPage from './pages/TrainingPlansPage';
import CoachAthletesPage from './pages/CoachAthletesPage';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <NotificationProvider>
                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/trainings" element={<TrainingsPage />} />
                        <Route path="/my-trainings" element={<MyTrainingsPage />} />
                        <Route path="/achievements" element={<AchievementsPage />} />
                        <Route path="/progress" element={<ProgressPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/training-plans" element={<TrainingPlansPage />} />
                        <Route path="/coach/athletes" element={<CoachAthletesPage />} />
                        <Route path="/competitions" element={<CompetitionsPage />} />
                        <Route path="/rating" element={<RatingPage />} />
                        <Route path="/import" element={<GarminImportPage />} />
                    </Routes>
                </NotificationProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
