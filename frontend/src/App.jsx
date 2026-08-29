import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChallengesPage from './pages/ChallengesPage';
import ChallengePage from './pages/ChallengePage';
import IncidentResponsePage from './pages/IncidentResponsePage';
import LeaderboardPage from './pages/LeaderboardPage';
import JudgePage from './pages/JudgePage';
import Layout from './components/Layout';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === 'judge' ? '/leaderboard' : '/'} replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {user ? (
          <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
            <Route
              index
              element={user.role === 'judge' ? <Navigate to="/leaderboard" replace /> : <DashboardPage user={user} />}
            />
            <Route path="challenges" element={<ChallengesPage user={user} />} />
            <Route path="challenge/play" element={<ChallengePage />} />
            <Route path="challenges/:id" element={<ChallengePage />} />
            <Route path="incident/:id" element={<IncidentResponsePage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            {user.role === 'judge' && (
              <Route path="judge" element={<JudgePage />} />
            )}
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
