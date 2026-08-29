import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Timer, Users, BarChart3, SkipForward, CheckCircle, RefreshCw } from 'lucide-react';
import { poolAPI, submissionAPI } from '../services/api';

export default function ChallengesPage({ user }) {
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [stats, setStats] = useState({ solved: 0, total: 0, points: 0, teamPoints: 0 });
  const [loading, setLoading] = useState(true);
  const [skipStatus, setSkipStatus] = useState({ skips_used: 0, skips_max: 3, skips_remaining: 3 });
  const [phaseInfo, setPhaseInfo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const nextRes = await poolAPI.getNext();
      const data = nextRes.data;

      if (data.assignment) {
        setAssignment(data.assignment);
        setPhaseInfo({ number: data.assignment.phase_number, name: data.assignment.phase_name });
      } else {
        setAssignment(null);
        setPhaseInfo({ message: data.message });
      }

      const skipRes = await poolAPI.getSkipStatus();
      setSkipStatus(skipRes.data);

      const histRes = await submissionAPI.getHistory();
      const submissions = histRes.data.submissions || [];
      const correct = submissions.filter(s => s.is_correct);
      const totalPoints = correct.reduce((sum, s) => sum + s.points_earned, 0);

      setStats(prev => ({
        ...prev,
        solved: correct.length,
        points: totalPoints
      }));

    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = () => {
    if (assignment) {
      navigate('/challenge/play');
    } else {
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Challenge Arena</h2>
          <p className="text-gray-600 mt-1">Questions are assigned from your team's pool &middot; 3-minute timer per question</p>
        </div>
        <button onClick={loadData} className="btn btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} label="Solved" value={stats.solved} color="green" />
        <StatCard icon={Timer} label="Time per Q" value="3 min" color="red" />
        <StatCard icon={SkipForward} label="Skips Left" value={`${skipStatus.skips_remaining}/${skipStatus.skips_max}`} color="yellow" />
        <StatCard icon={BarChart3} label="Your Points" value={stats.points} color="blue" />
      </div>

      {phaseInfo && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Competition Phase</h3>
              <p className="text-sm text-gray-600">
                {phaseInfo.number ? `Phase ${phaseInfo.number}: ${phaseInfo.name}` : phaseInfo.message || 'Waiting for judge to start'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={startChallenge} className="btn btn-primary flex items-center gap-2 text-lg px-8 py-4">
              <Play className="w-6 h-6" />
              {assignment ? 'Start Playing' : 'Get Question'}
            </button>
          </div>
        </div>
      )}

      <SubmissionHistory />
    </div>
  );
}

function SubmissionHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionAPI.getHistory()
      .then(res => setSubmissions(res.data.submissions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || submissions.length === 0) return null;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Submission History</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {submissions.slice(0, 20).map(sub => (
          <div key={sub.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                sub.is_correct ? 'bg-green-500' : sub.skipped ? 'bg-gray-400' : 'bg-red-500'
              }`} />
              <span className="text-gray-700 truncate">{sub.title}</span>
              {sub.skipped ? (
                <span className="text-xs text-gray-500">(Skipped)</span>
              ) : (
                <span className="text-xs text-gray-500">(Attempt {sub.attempt_number})</span>
              )}
            </div>
            <span className={`font-medium flex-shrink-0 ml-2 ${
              sub.is_correct ? 'text-green-600' : sub.skipped ? 'text-gray-400' : 'text-red-600'
            }`}>
              {sub.is_correct ? `+${sub.points_earned}` : sub.skipped ? '-' : sub.points_earned > 0 && !sub.is_correct ? `${sub.points_earned}` : '×'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
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