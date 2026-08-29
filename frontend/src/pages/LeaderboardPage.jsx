import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Activity, Users, User } from 'lucide-react';
import { leaderboardAPI } from '../services/api';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('individual');
  const [animateRanks, setAnimateRanks] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setAnimateRanks(true);
      loadData();
      setTimeout(() => setAnimateRanks(false), 1000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [individualRes, teamRes] = await Promise.all([
        leaderboardAPI.get(),
        leaderboardAPI.getTeams()
      ]);
      setLeaderboard(individualRes.data.leaderboard);
      setTeamLeaderboard(teamRes.data.teams || []);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentData = tab === 'individual' ? leaderboard : teamLeaderboard;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 animate-pulse text-green-500" />
            Real-time rankings &middot; Auto-refreshes every 30s
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          Live
        </div>
      </div>

      <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm">
        <button
          onClick={() => setTab('individual')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
            tab === 'individual'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4" />
          Individual
        </button>
        <button
          onClick={() => setTab('teams')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
            tab === 'teams'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Teams
        </button>
      </div>

      {currentData.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`card text-center transform transition-all duration-500 hover:scale-105 ${animateRanks ? 'scale-110' : ''} md:order-1`}>
            <div className="flex justify-center mb-3">{getRankIcon(2)}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {tab === 'individual' ? currentData[1]?.username : currentData[1]?.team_name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {tab === 'individual' ? currentData[1]?.team_name : `${currentData[1]?.member_count} members`}
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div>
                <p className="text-2xl font-bold text-blue-600">{currentData[1]?.total_points}</p>
                <p className="text-gray-500">Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{currentData[1]?.solved_count}</p>
                <p className="text-gray-500">Solved</p>
              </div>
            </div>
          </div>

          <div className={`card text-center transform transition-all duration-500 hover:scale-105 ${animateRanks ? 'scale-110' : ''} ring-4 ring-yellow-400 md:order-2 md:-mt-4`}>
            <div className="flex justify-center mb-3">{getRankIcon(1)}</div>
            <div className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold rounded-full mb-2">CHAMPION</div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {tab === 'individual' ? currentData[0]?.username : currentData[0]?.team_name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {tab === 'individual' ? currentData[0]?.team_name : `${currentData[0]?.member_count} members`}
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div>
                <p className="text-3xl font-bold text-blue-600">{currentData[0]?.total_points}</p>
                <p className="text-gray-500">Points</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{currentData[0]?.solved_count}</p>
                <p className="text-gray-500">Solved</p>
              </div>
            </div>
          </div>

          <div className={`card text-center transform transition-all duration-500 hover:scale-105 ${animateRanks ? 'scale-110' : ''} md:order-3`}>
            <div className="flex justify-center mb-3">{getRankIcon(3)}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {tab === 'individual' ? currentData[2]?.username : currentData[2]?.team_name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {tab === 'individual' ? currentData[2]?.team_name : `${currentData[2]?.member_count} members`}
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div>
                <p className="text-2xl font-bold text-blue-600">{currentData[2]?.total_points}</p>
                <p className="text-gray-500">Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{currentData[2]?.solved_count}</p>
                <p className="text-gray-500">Solved</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {tab === 'individual' ? 'Player' : 'Team'}
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Solved</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Points</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Last Submission</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id || item.team_name} className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 ${animateRanks ? 'bg-blue-50' : ''}`}>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center w-12">
                      {index < 3 ? (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRankBadgeColor(index + 1)} flex items-center justify-center`}>
                          {getRankIcon(index + 1)}
                        </div>
                      ) : getRankIcon(index + 1)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {tab === 'individual' ? item.username : item.team_name}
                        {index < 3 && <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">TOP {index + 1}</span>}
                      </p>
                      <p className="text-sm text-gray-500">
                        {tab === 'individual' ? item.team_name : `${item.member_count} members &middot; ${item.team_code}`}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-800 rounded-full font-semibold text-lg">{item.solved_count}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-2xl font-bold text-blue-600">{item.total_points}</span>
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-gray-500">
                    {item.last_submission ? new Date(item.last_submission).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {currentData.length === 0 && (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}