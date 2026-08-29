import { useEffect, useState } from 'react';
import { BarChart, TrendingUp, Award } from 'lucide-react';
import { leaderboardAPI } from '../services/api';

export default function TeamAnalytics({ compact = false }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await leaderboardAPI.get();
      setTeams(response.data.leaderboard);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const maxPoints = Math.max(...teams.map(t => t.total_points), 1);

  if (compact) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Top Performers</h3>
          <Award className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="space-y-3">
          {teams.slice(0, 5).map((team, idx) => (
            <div key={team.id} className="flex items-center gap-3">
              <div className="text-2xl font-bold text-gray-400">#{idx + 1}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{team.team_name}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(team.total_points / maxPoints) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{team.total_points}</p>
                <p className="text-xs text-gray-500">{team.solved_count} solved</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <BarChart className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold">Team Performance Analysis</h3>
      </div>

      <div className="space-y-4">
        {teams.map((team, idx) => (
          <div key={team.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`text-2xl font-bold ${idx < 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                  #{idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{team.team_name}</p>
                  <p className="text-sm text-gray-500">@{team.username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{team.total_points}</p>
                <p className="text-sm text-gray-500">points</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center p-2 bg-white rounded">
                <p className="text-2xl font-bold text-green-600">{team.solved_count}</p>
                <p className="text-xs text-gray-500">Solved</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round((team.solved_count / 10) * 100)}%
                </p>
                <p className="text-xs text-gray-500">Progress</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-2xl font-bold text-orange-600">
                  {team.total_points > 0 ? Math.round(team.total_points / team.solved_count) : 0}
                </p>
                <p className="text-xs text-gray-500">Avg Points</p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${(team.total_points / maxPoints) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
