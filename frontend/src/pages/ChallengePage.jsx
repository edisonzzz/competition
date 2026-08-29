import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Lightbulb, CheckCircle, XCircle, Timer, SkipForward, AlertTriangle, Terminal as TerminalIcon } from 'lucide-react';
import { poolAPI, submissionAPI } from '../services/api';
import TerminalEmulator from '../components/TerminalEmulator';

export default function ChallengePage() {
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [skipsRemaining, setSkipsRemaining] = useState(3);
  const [showTerminal, setShowTerminal] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const timerRef = useRef(null);

  const loadNextQuestion = async () => {
    try {
      setLoading(true);
      setResult(null);
      setAnswer('');
      setShowHints(false);
      setIsTimeout(false);
      setShowTerminal(false);

      const response = await poolAPI.getNext();
      const data = response.data;

      if (data.assignment) {
        setAssignment(data.assignment);
        setTimeLeft(data.assignment.time_remaining);
      } else {
        setAssignment(null);
        setTimeLeft(null);
      }

      const skipRes = await poolAPI.getSkipStatus();
      setSkipsRemaining(skipRes.data.skips_remaining);
    } catch (error) {
      console.error('Failed to load question:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNextQuestion();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft !== null]);

  const handleTimeout = () => {
    setIsTimeout(true);
    setResult({
      is_correct: false,
      message: '⏰ Time is up! Question returned to pool.',
      type: 'timeout'
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!timeLeft || timeLeft > 120) return 'text-green-600';
    if (timeLeft > 60) return 'text-yellow-600';
    return 'text-red-600 animate-pulse';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || !assignment) return;

    setSubmitting(true);
    setResult(null);

    try {
      const response = await submissionAPI.submit({
        challenge_id: assignment.challenge_id,
        answer: answer.trim()
      });

      setResult({ ...response.data, type: response.data.is_correct ? 'correct' : 'incorrect' });

      if (response.data.is_correct) {
        setTimeout(() => {
          loadNextQuestion();
        }, 3000);
      }
    } catch (error) {
      setResult({
        is_correct: false,
        message: error.response?.data?.error || 'Submission failed. Please try again.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!assignment || skipsRemaining <= 0) return;

    try {
      const response = await poolAPI.skip(assignment.challenge_id);
      setSkipsRemaining(response.data.skips_remaining);
      loadNextQuestion();
    } catch (error) {
      setResult({
        is_correct: false,
        message: error.response?.data?.error || 'Skip failed',
        type: 'error'
      });
    }
  };

  const getAttemptLabel = () => {
    if (!assignment) return '';
    const a = assignment.attempt_number;
    if (a === 1) return 'First attempt (full score)';
    if (a === 2) {
      if (assignment.type === 'multiple_choice') return '2nd attempt (60% scoring)';
      if (assignment.type === 'practical') return '2nd attempt (60% scoring)';
      if (assignment.type === 'incident_response') return '2nd attempt (70% scoring)';
    }
    return `${a}th attempt`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-16">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Questions Available</h2>
          <p className="text-gray-500 mb-6">
            All questions in the pool have been completed or are being answered by teammates.
          </p>
          <button onClick={loadNextQuestion} className="btn btn-primary">Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Phase {assignment.phase_number} &middot; {assignment.phase_name}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <SkipForward className="w-4 h-4 text-gray-500" />
            <span className={skipsRemaining > 0 ? 'text-gray-700' : 'text-red-600 font-semibold'}>
              Skips: {skipsRemaining}/3
            </span>
          </div>
          <div className={`flex items-center gap-2 font-bold text-lg ${getTimerColor()}`}>
            <Timer className="w-5 h-5" />
            {formatTime(timeLeft || 0)}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="badge bg-blue-50 text-blue-800">{assignment.category}</span>
              <span className={`badge ${
                assignment.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                assignment.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>{assignment.difficulty}</span>
              <span className="badge bg-purple-50 text-purple-800">
                {assignment.type === 'multiple_choice' ? 'Multiple Choice' :
                 assignment.type === 'practical' ? 'Practical' : 'Incident Response'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{assignment.points}</div>
            <div className="text-sm text-gray-500">pts</div>
          </div>
        </div>

        {assignment.attempt_number > 1 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <span className="text-sm text-yellow-800">{getAttemptLabel()}</span>
          </div>
        )}

        <div className="prose max-w-none mb-6">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {assignment.description}
          </div>
        </div>

        {assignment.type === 'multiple_choice' && assignment.options && assignment.options.length > 0 && (
          <div className="space-y-3 mb-6">
            {assignment.options.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  answer === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                } ${isTimeout ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option.value}
                  checked={answer === option.value}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-5 h-5 text-blue-600"
                  disabled={isTimeout}
                />
                <span className="ml-3 flex-1">
                  <span className="font-semibold text-gray-900">{option.value}.</span>
                  <span className="ml-2 text-gray-700">{option.label}</span>
                </span>
              </label>
            ))}
          </div>
        )}

        {assignment.type !== 'multiple_choice' && !isTimeout && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              className="input w-full"
              rows="3"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer..."
              disabled={submitting || isTimeout}
            />
          </div>
        )}

        {assignment.type !== 'multiple_choice' && assignment.hints && Array.isArray(assignment.hints) && assignment.hints.length > 0 && !isTimeout && (
          <div className="mb-6">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Lightbulb className="w-5 h-5" />
              {showHints ? 'Hide Hints' : 'Show Hints'}
            </button>
            {showHints && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {assignment.hints.map((hint, idx) => (
                    <li key={idx} className="text-sm text-gray-700">{hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {assignment.type === 'practical' && !isTimeout && (
          <div className="mb-6">
            <button
              onClick={() => setShowTerminal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <TerminalIcon className="w-5 h-5" />
              Open Linux Terminal
            </button>
            <p className="text-sm text-gray-500 mt-2">Use terminal commands to investigate, then submit your answer</p>
          </div>
        )}

        {!isTimeout && (
          <div className="flex gap-3">
            <form onSubmit={handleSubmit} className="flex-1">
              {assignment.type !== 'multiple_choice' && (
                <div className="mb-4">
                  <textarea
                    className="input w-full"
                    rows="3"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    disabled={submitting}
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={submitting || !answer.trim()}
                className="btn btn-primary flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            </form>

            {skipsRemaining > 0 && (
              <button
                onClick={handleSkip}
                disabled={submitting}
                className="btn btn-secondary flex items-center gap-2"
                title={`${skipsRemaining} skips remaining`}
              >
                <SkipForward className="w-5 h-5" />
                Skip
              </button>
            )}
          </div>
        )}

        {isTimeout && (
          <div className="text-center py-6">
            <Timer className="w-16 h-16 text-red-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Time is up! Question returned to pool.</p>
            <button onClick={loadNextQuestion} className="btn btn-primary">Get Next Question</button>
          </div>
        )}

        {result && result.type !== 'timeout' && (
          <div
            className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
              result.is_correct
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {result.is_correct ? (
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold">{result.message}</p>
              {result.points_earned !== undefined && (
                <p className="text-sm mt-1">
                  {result.is_correct
                    ? `Earned ${result.points_earned} pts`
                    : `Score: ${result.points_earned > 0 ? '+' : ''}${result.points_earned}`
                  }
                  {result.attempt_number > 1 && ` (Attempt ${result.attempt_number})`}
                </p>
              )}
              {result.team_total_points !== undefined && (
                <p className="text-sm mt-1 text-blue-600">
                  Team Total: {result.team_total_points} pts
                </p>
              )}
              {result.is_correct && (
                <p className="text-xs text-gray-500 mt-1">Loading next question in 3 seconds...</p>
              )}
            </div>
          </div>
        )}

        {showTerminal && (
          <TerminalEmulator
            onClose={() => setShowTerminal(false)}
            challengeId={assignment.challenge_id}
          />
        )}
      </div>
    </div>
  );
}