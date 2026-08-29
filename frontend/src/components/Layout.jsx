import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Trophy, FileText, Settings, LogOut, Play, Users } from 'lucide-react';
import CompetitionTimer from './CompetitionTimer';
import anssiLogo from '../assets/anssi-logo.png';

export default function Layout({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems = [];

  if (user.role === 'judge') {
    navItems.push(
      { path: '/judge', icon: Settings, label: 'Admin Panel' },
      { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
      { path: '/challenges', icon: FileText, label: 'Challenges' }
    );
  } else {
    navItems.push(
      { path: '/', icon: Home, label: 'Home' },
      { path: '/challenges', icon: Play, label: 'Play' },
      { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-14 flex items-center justify-center">
                <img src={anssiLogo} alt="ANSSI" className="max-h-14 w-auto object-contain" />
              </div>
              <div className="leading-tight">
                <span className="text-lg font-bold text-gray-900">ANSSI</span>
                <p className="text-[10px] text-orange-600 font-medium">Côte d'Ivoire Cybersecurity Competition</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <CompetitionTimer />

              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">
                  {user.team_name || ''} &middot; {user.role === 'judge' ? 'Judge' : 'Player'}
                </p>
              </div>
              <button onClick={onLogout} className="btn btn-secondary flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}