import { useEffect, useState } from 'react';
import { Trophy, Target, CheckCircle, Users, TrendingUp, Medal } from 'lucide-react';
import { challengeAPI, submissionAPI, leaderboardAPI } from '../services/api';

export default function DashboardPage({ user }) {
  const [stats, setStats] = useState({
    totalChallenges: 0,
    solvedChallenges: 0,
    totalPoints: 0,
    teamTotalPoints: 0,
    teamRank: 0,
    teamMemberCount: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [challengesRes, submissionsRes, leaderboardRes] = await Promise.all([
        challengeAPI.getAll(),
        submissionAPI.getHistory(),
        leaderboardAPI.get()
      ]);

      const challenges = challengesRes.data.challenges;
      const submissions = submissionsRes.data.submissions;
      const leaderboard = leaderboardRes.data.leaderboard;

      const solvedCount = challenges.filter(c => c.solved > 0).length;
      const totalPoints = submissions
        .filter(s => s.is_correct)
        .reduce((sum, s) => sum + s.points_earned, 0);

      let teamTotalPoints = 0;
      let teamMemberCount = 0;
      if (user.team_name) {
        const teamMembers = leaderboard.filter(u => u.team_name === user.team_name);
        teamTotalPoints = teamMembers.reduce((sum, u) => sum + u.total_points, 0);
        teamMemberCount = teamMembers.length;
      }

      const userRank = leaderboard.findIndex(u => u.id === user.id) + 1;

      setStats({
        totalChallenges: challenges.length,
        solvedChallenges: solvedCount,
        totalPoints,
        teamTotalPoints,
        teamRank: userRank,
        teamMemberCount
      });

      setRecentSubmissions(submissions.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.username}!
        </h2>
        <p className="text-gray-600 mt-1">Compete in the cybersecurity challenge and earn points for your team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Total Challenges" value={stats.totalChallenges} color="blue" />
        <StatCard icon={CheckCircle} label="Solved" value={stats.solvedChallenges} color="green" />
        <StatCard icon={Trophy} label="Your Points" value={stats.totalPoints} color="yellow" />
        <StatCard icon={Medal} label="Your Rank" value={`#${stats.teamRank}`} color="purple" />
      </div>

      {user.team_name && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user.team_name}</h3>
                <p className="text-sm text-gray-600">{stats.teamMemberCount} members</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{stats.teamTotalPoints}</div>
              <div className="text-sm text-gray-600">Team Total Points</div>
            </div>
          </div>
          {stats.totalPoints > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>You contributed {stats.totalPoints > 0 ? Math.round((stats.totalPoints / stats.teamTotalPoints) * 100) : 0}% of team points</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.teamTotalPoints > 0 ? (stats.totalPoints / stats.teamTotalPoints) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Completed {stats.solvedChallenges} / {stats.totalChallenges} challenges</span>
            <span>{Math.round((stats.solvedChallenges / stats.totalChallenges) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(stats.solvedChallenges / stats.totalChallenges) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>
        {recentSubmissions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No submissions yet</p>
        ) : (
          <div className="space-y-3">
            {recentSubmissions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${sub.is_correct ? 'bg-green-500' : sub.skipped ? 'bg-gray-400' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium text-gray-900">{sub.title}</p>
                    <p className="text-sm text-gray-500">{sub.category} &middot; {sub.difficulty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${sub.is_correct ? 'text-green-600' : sub.skipped ? 'text-gray-400' : 'text-red-600'}`}>
                    {sub.is_correct ? `+${sub.points_earned}` : sub.skipped ? 'Skipped' : '×'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {sub.skipped ? '' : `Attempt ${sub.attempt_number}`} &middot; {new Date(sub.submitted_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}