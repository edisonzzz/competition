import { useEffect, useState } from 'react';
import { PieChart, Target, CheckCircle, XCircle } from 'lucide-react';
import { leaderboardAPI } from '../services/api';

export default function ChallengeAnalytics({ compact = false }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await leaderboardAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load challenge stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const totalTeams = 10;
  const maxSolves = Math.max(...stats.map(s => s.solve_count), 1);

  if (compact) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Challenge Difficulty</h3>
          <Target className="w-5 h-5 text-purple-500" />
        </div>
        <div className="space-y-3">
          {stats.slice(0, 5).map((challenge) => {
            const solveRate = Math.round((challenge.solve_count / totalTeams) * 100);
            const difficulty = solveRate > 70 ? 'Easy' : solveRate > 40 ? 'Medium' : 'Hard';
            const color = solveRate > 70 ? 'green' : solveRate > 40 ? 'yellow' : 'red';

            return (
              <div key={challenge.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{challenge.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`bg-${color}-500 h-1.5 rounded-full`}
                        style={{ width: `${solveRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{solveRate}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <PieChart className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-semibold">Challenge Success Rate Analysis</h3>
      </div>

      <div className="space-y-4">
        {stats.map((challenge) => {
          const solveRate = Math.round((challenge.solve_count / totalTeams) * 100);
          const difficulty = solveRate > 70 ? 'Easy' : solveRate > 40 ? 'Medium' : 'Hard';
          const colorClasses = {
            Easy: 'bg-green-100 text-green-800 border-green-300',
            Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            Hard: 'bg-red-100 text-red-800 border-red-300'
          };
          const barColors = {
            Easy: 'from-green-400 to-green-600',
            Medium: 'from-yellow-400 to-yellow-600',
            Hard: 'from-red-400 to-red-600'
          };

          return (
            <div key={challenge.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded border ${colorClasses[difficulty]}`}>
                      {difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{challenge.category}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-blue-600">{challenge.points}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="flex items-center gap-2 p-2 bg-white rounded">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-lg font-bold text-gray-900">{challenge.solve_count}</p>
                    <p className="text-xs text-gray-500">Solved</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-lg font-bold text-gray-900">{totalTeams - challenge.solve_count}</p>
                    <p className="text-xs text-gray-500">Unsolved</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded">
                  <Target className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-lg font-bold text-gray-900">{solveRate}%</p>
                    <p className="text-xs text-gray-500">Success</p>
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`bg-gradient-to-r ${barColors[difficulty]} h-3 rounded-full transition-all duration-1000 relative overflow-hidden`}
                  style={{ width: `${solveRate}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
