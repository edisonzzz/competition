import { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle, TrendingUp, Plus, Clock, Power, UserPlus } from 'lucide-react';
import { judgeAPI } from '../services/api';
import CreateChallengeModal from '../components/CreateChallengeModal';
import CompetitionControlPanel from '../components/CompetitionControlPanel';
import ChallengeAnalytics from '../components/ChallengeAnalytics';
import TeamAnalytics from '../components/TeamAnalytics';
import TeamProgressChart from '../components/TeamProgressChart';
import TeamManagement from '../components/TeamManagement';

export default function JudgePage() {
  const [statistics, setStatistics] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, teams, challenges, submissions, control

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, subsRes] = await Promise.all([
        judgeAPI.getStatistics(),
        judgeAPI.getSubmissions()
      ]);

      setStatistics(statsRes.data.statistics);
      setSubmissions(subsRes.data.submissions);
    } catch (error) {
      console.error('Failed to load judge data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'team-management', label: 'Team Management', icon: UserPlus },
    { id: 'teams', label: 'Team Analytics', icon: Users },
    { id: 'challenges', label: 'Challenge Analytics', icon: FileText },
    { id: 'submissions', label: 'Recent Submissions', icon: CheckCircle },
    { id: 'control', label: 'Competition Control', icon: Power }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-600 mt-1">Competition management and analytics</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Challenge
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Statistics Overview */}
      {activeTab === 'overview' && statistics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              label="Teams"
              value={statistics.total_teams}
              color="blue"
            />
            <StatCard
              icon={FileText}
              label="Challenges"
              value={statistics.total_challenges}
              color="purple"
            />
            <StatCard
              icon={CheckCircle}
              label="Correct Submissions"
              value={statistics.correct_submissions}
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              label="Accuracy Rate"
              value={`${statistics.accuracy_rate}%`}
              color="yellow"
            />
          </div>

          {/* Team Progress Chart */}
          <TeamProgressChart />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TeamAnalytics compact={true} />
            <ChallengeAnalytics compact={true} />
          </div>
        </>
      )}

      {/* Team Analytics Tab */}
      {activeTab === 'teams' && <TeamAnalytics />}

      {/* Challenge Analytics Tab */}
      {activeTab === 'challenges' && <ChallengeAnalytics />}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Time</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Team</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Challenge</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Answer</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">Result</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Points</th>
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 50).map((sub) => (
                  <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-600">
                      {new Date(sub.submitted_at).toLocaleString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-medium text-gray-900">{sub.team_name}</p>
                        <p className="text-xs text-gray-500">@{sub.username}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-900">{sub.challenge_title}</td>
                    <td className="py-3 px-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {sub.answer.length > 20 ? sub.answer.substring(0, 20) + '...' : sub.answer}
                      </code>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block w-16 py-1 rounded-full text-xs font-semibold ${
                          sub.is_correct
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {sub.is_correct ? 'Correct' : 'Wrong'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-blue-600">
                      {sub.points_earned || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {submissions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No submissions yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Management Tab */}
      {activeTab === 'team-management' && <TeamManagement />}

      {/* Competition Control Tab */}
      {activeTab === 'control' && <CompetitionControlPanel />}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <CreateChallengeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
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
