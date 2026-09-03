import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Terminal as TerminalIcon } from 'lucide-react';
import api from '../services/api';
import TerminalEmbedded from '../components/TerminalEmbedded';

export default function IncidentResponsePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [phases, setPhases] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async (preferredPhaseNumber = null) => {
    try {
      const [challengeRes, phasesRes] = await Promise.all([
        api.get(`/challenges/${id}`),
        api.get(`/phases/${id}/phases`)
      ]);

      const loadedPhases = phasesRes.data.phases;
      setChallenge(challengeRes.data.challenge);
      setPhases(loadedPhases);

      const preferredIndex = preferredPhaseNumber
        ? loadedPhases.findIndex(p => p.phase_number === preferredPhaseNumber)
        : -1;
      const firstIncomplete = loadedPhases.findIndex(p => !p.completed);
      const fallbackIndex = firstIncomplete === -1
        ? Math.max(loadedPhases.length - 1, 0)
        : firstIncomplete;

      setCurrentPhase(preferredIndex >= 0 ? preferredIndex : fallbackIndex);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const phase = phases[currentPhase];

      const response = await api.post(
        `/phases/${id}/phases/${phase.id}/submit`,
        { answers }
      );

      setResult({
        success: response.data.is_correct,
        message: response.data.is_correct
          ? `Phase ${phase.phase_number} completed! +${response.data.points_earned} points`
          : `${response.data.correct_count}/${response.data.total_fields} fields correct. Try again.`,
        points: response.data.points_earned
      });

      if (response.data.is_correct) {
        setAnswers({});

        if (response.data.challenge_completed) {
          await loadData();
          setResult({
            success: true,
            message: 'Incident Response complete. All five phases have been verified.',
            points: response.data.points_earned
          });
        } else {
          await loadData(response.data.next_phase_number);
          setResult({
            success: true,
            message: `Phase ${phase.phase_number} verified. Phase ${response.data.next_phase_number} is now unlocked.`,
            points: response.data.points_earned
          });
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.error || 'Submission failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading incident...</div>;
  }

  if (!challenge || phases.length === 0) {
    return <div className="text-center py-12">Incident not found</div>;
  }

  const phase = phases[currentPhase];
  const completedCount = phases.filter(p => p.completed).length;
  const progressPercent = (completedCount / phases.length) * 100;
  const firstIncompleteIndex = phases.findIndex(p => !p.completed);
  const maxUnlockedIndex = firstIncompleteIndex === -1
    ? phases.length - 1
    : firstIncompleteIndex;
  const activePhaseNumber = firstIncompleteIndex === -1
    ? phases.length
    : phases[firstIncompleteIndex].phase_number;

  const selectPhase = (index) => {
    if (index > maxUnlockedIndex) return;
    setCurrentPhase(index);
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/challenges')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Challenges
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
            <p className="text-gray-600 mt-2">{challenge.description}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">{challenge.points}</div>
            <div className="text-sm text-gray-500">total points</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Phase {activePhaseNumber} of {phases.length}
            </span>
            <span className="text-sm text-gray-500">
              {completedCount} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Three column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SOP Steps */}
        <div className="lg:col-span-3 card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Investigation Flow
          </h3>
          <div className="space-y-2">
            {phases.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => selectPhase(idx)}
                disabled={idx > maxUnlockedIndex}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  idx === currentPhase
                    ? 'bg-blue-50 border-2 border-blue-500 text-blue-900'
                    : p.completed
                    ? 'bg-green-50 border border-green-300 text-green-900'
                    : 'bg-gray-50 border border-gray-200 text-gray-600'
                } ${idx > maxUnlockedIndex ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
              >
                <div className="flex items-start gap-2">
                  {p.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-current flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold mb-1">Phase {p.phase_number}</div>
                    <div className="text-sm font-medium">{p.title}</div>
                    {p.completed && (
                      <div className="text-xs text-green-600 mt-1">+{p.points_earned} pts</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Investigation Terminal */}
        <div className="lg:col-span-6 card">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {phase.title}
            </h3>
            <p className="text-gray-600 mb-4">{phase.description}</p>
          </div>

          {phase.target_objective && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="font-semibold text-blue-900 mb-1">🎯 Objective:</div>
              <div className="text-blue-800 text-sm">{phase.target_objective}</div>
            </div>
          )}

          {/* Embedded Terminal */}
          <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TerminalIcon className="w-4 h-4 text-green-400" />
                <span className="text-white text-xs font-mono">admin@blueteam-challenge:~</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="h-64">
              <TerminalEmbedded onClose={() => {}} compact={true} />
            </div>
          </div>
        </div>

        {/* Right: Submission Form */}
        <div className="lg:col-span-3 card">
          <h3 className="text-lg font-semibold mb-4">Submit Findings</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {phase.required_fields && phase.required_fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  className="input"
                  value={answers[field.name] || ''}
                  onChange={(e) => setAnswers({ ...answers, [field.name]: e.target.value })}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  disabled={phase.completed}
                  required
                />
              </div>
            ))}

            {result && (
              <div className={`p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {result.message}
              </div>
            )}

            {!phase.completed && (
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn btn-primary"
              >
                {submitting ? 'Submitting...' : 'Submit Phase'}
              </button>
            )}

            {phase.completed && (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-green-900">Phase Complete!</div>
              </div>
            )}
          </form>
        </div>
      </div>

      </div>
  );
}
