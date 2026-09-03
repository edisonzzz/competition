import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Lightbulb, CheckCircle, XCircle, Timer, SkipForward, AlertTriangle, Terminal as TerminalIcon } from 'lucide-react';
import { poolAPI, submissionAPI } from '../services/api';
import TerminalEmbedded from '../components/TerminalEmbedded';
import useLang from '../useLang';

export default function ChallengePage() {
  const navigate = useNavigate();
  const { _t, lang } = useLang();
  const [assignment, setAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [skipsRemaining, setSkipsRemaining] = useState(3);
  const [isTimeout, setIsTimeout] = useState(false);
  const timerRef = useRef(null);

  const loadNextQuestion = async () => {
    try {
      setLoading(true);
      setResult(null);
      setAnswer('');
      setShowHints(false);
      setIsTimeout(false);

      const response = await poolAPI.getNext();
      const data = response.data;

      if (data.assignment) {
        setAssignment(data.assignment);
        setTimeLeft(data.assignment.time_remaining);
        setSkipsRemaining(data.assignment.skips_remaining || 3);
        startTimer(data.assignment.time_remaining);
      } else {
        setAssignment(null);
        navigate('/challenges');
      }
    } catch (error) {
      console.error('Failed to load question:', error);
      navigate('/challenges');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimeout(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    loadNextQuestion();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    try {
      const response = await submissionAPI.submit({ challenge_id: assignment.challenge_id, answer: answer.trim() });
      const data = response.data;
      setResult(data);
      if (data.is_correct && timerRef.current) clearInterval(timerRef.current);
      if (data.is_correct) {
        setTimeout(() => loadNextQuestion(), 3000);
      }
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await poolAPI.skip(assignment.challenge_id);
      setSkipsRemaining(prev => prev - 1);
      setResult({ skipped: true, message: 'Skipped', is_correct: false });
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => loadNextQuestion(), 1500);
    } catch (error) {
      console.error('Failed to skip:', error);
    }
  };

  const getAttemptLabel = () => {
    const remaining = 2 - (assignment.attempt_number - 1);
    return `Attempt ${assignment.attempt_number} of 2 (${remaining} attempt${remaining > 1 ? 's' : ''} remaining)`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{_t('challenges.loading')}</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{_t('challengePlay.completed')}</h2>
        <p className="text-gray-600 mb-6">{_t('challengePlay.phaseCompleted')}</p>
        <button onClick={() => navigate('/challenges')} className="btn btn-primary">
          {_t('challenges.title')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/challenges')} className="btn btn-secondary flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> {_t('challenges.title')}
      </button>

      {/* Timer */}
      {timeLeft !== null && !result && !isTimeout && (
        <div className={`card ${timeLeft < 30 ? 'bg-red-50 border-red-200' : ''}`}>
          <div className="flex items-center gap-3">
            <Timer className={`w-6 h-6 ${timeLeft < 30 ? 'text-red-600 animate-pulse' : 'text-gray-600'}`} />
            <div className="flex-1">
              <div className="text-sm text-gray-600">{_t('challengePlay.timeRemaining')}</div>
              <div className={`text-2xl font-bold font-mono ${timeLeft < 30 ? 'text-red-600' : 'text-gray-900'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      )}

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
                {assignment.type === 'multiple_choice' ? _t('challengePlay.multipleChoice') :
                 assignment.type === 'practical' ? _t('challengePlay.practical') : _t('challengePlay.incidentResponse')}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{assignment.points}</div>
            <div className="text-sm text-gray-500">{_t('challengePlay.pts')}</div>
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
              {_t('challengePlay.yourAnswer')}
            </label>
            <textarea
              className="input w-full"
              rows="3"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={_t('challengePlay.enterAnswer')}
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
              {showHints ? _t('challengePlay.hideHints') : _t('challengePlay.hints')}
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
            <div className="flex items-center gap-2 mb-2">
              <TerminalIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">{_t('challengePlay.terminal')}</span>
            </div>
            <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden" style={{height:'300px'}}>
              <div className="bg-gray-800 px-3 py-1.5 flex items-center justify-between">
                <span className="text-white text-xs font-mono">admin@blueteam-challenge:~</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
              </div>
              <div className="h-[calc(300px-32px)]">
                <TerminalEmbedded compact={true} />
              </div>
            </div>
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
                    placeholder={_t('challengePlay.enterAnswer')}
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
                {submitting ? _t('challengePlay.submitting') : _t('challengePlay.submit')}
              </button>
            </form>

            {skipsRemaining > 0 && (
              <button
                onClick={handleSkip}
                disabled={submitting}
                className="btn btn-secondary flex items-center gap-2"
                title={`${skipsRemaining} ${_t('challengePlay.skipsRemaining')}`}
              >
                <SkipForward className="w-5 h-5" />
                {_t('challengePlay.skip')}
              </button>
            )}
          </div>
        )}

        {isTimeout && (
          <div className="text-center py-6">
            <Timer className="w-16 h-16 text-red-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">{_t('challengePlay.timeUp')}</p>
            <button onClick={loadNextQuestion} className="btn btn-primary">{_t('challengePlay.getNext')}</button>
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
                    ? `${_t('challengePlay.earned')} ${result.points_earned} ${_t('challengePlay.pts')}`
                    : `${_t('challengePlay.score')}: ${result.points_earned > 0 ? '+' : ''}${result.points_earned}`
                  }
                  {result.attempt_number > 1 && ` (${_t('challengePlay.attempts')} ${result.attempt_number})`}
                </p>
              )}
              {result.team_total_points !== undefined && (
                <p className="text-sm mt-1 text-blue-600">
                  {_t('challengePlay.teamTotal')}: {result.team_total_points} {_t('challengePlay.pts')}
                </p>
              )}
              {result.is_correct && (
                <p className="text-xs text-gray-500 mt-1">{_t('challengePlay.loadingNext')}</p>
              )}
              {result.attempts_remaining === 0 && !result.is_correct && (
                <p className="text-xs mt-1">{_t('challengePlay.getNext')}</p>
              )}
            </div>
          </div>
        )}
      </div>

</div>
  );
}