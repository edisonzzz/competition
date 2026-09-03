import { useState, useEffect } from 'react';
import { Power, Clock, SkipForward, Loader, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function CompetitionControlPanel() {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadStatus(); }, []);

  const loadStatus = async () => {
    try {
      const res = await api.get('/judge/competition-status');
      setIsActive(res.data.is_active);
      setCurrentPhase(res.data.current_phase);
      setPhases(res.data.phases || []);
    } catch (e) {
      console.error('Failed to load status');
    } finally {
      setLoading(false);
    }
  };

  const doAction = async (action) => {
    setProcessing(true);
    setMessage('');
    try {
      const res = await api.post('/judge/competition-control', { action });
      setIsActive(res.data.is_active);
      setCurrentPhase(res.data.current_phase);
      setPhases(res.data.phases || []);
      if (action === 'start') setMessage('Competition started! Phase 1 active');
      else if (action === 'next_phase') setMessage('Advanced to next phase');
      else if (action === 'stop') setMessage('Competition stopped');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex items-center gap-3 p-4"><Loader className="w-5 h-5 animate-spin" /> Loading...</div>;
  }

  const phaseNames = {
    1: 'Phase 1: Multiple Choice',
    2: 'Phase 2: Technical/Practical',
    3: 'Phase 3: Incident Response',
  };

  return (
    <div className="space-y-6">
      {/* Competition Status + Phase Switcher */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold">Competition Control</h3>
            <p className="text-sm text-gray-600 mt-1">Manage competition phases</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? '🟢 ACTIVE' : '🔴 STOPPED'}
          </div>
        </div>

        {/* Phase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(num => {
            const phase = phases.find(p => p.number === num);
            const isActivePhase = phase?.active;
            return (
              <div key={num} className={`p-4 rounded-lg border-2 transition-colors ${
                isActivePhase
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Phase {num}</span>
                  {isActivePhase && <CheckCircle className="w-5 h-5 text-green-600" />}
                </div>
                <p className="text-sm text-gray-600 mb-3">{phaseNames[num]}</p>
                <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                  isActivePhase
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {isActivePhase ? 'Active' : 'Inactive'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
          {!isActive ? (
            <button
              onClick={() => doAction('start')}
              disabled={processing}
              className="btn btn-primary flex items-center gap-2"
            >
              <Power className="w-5 h-5" />
              {processing ? 'Processing...' : 'Start Competition (Phase 1)'}
            </button>
          ) : (
            <>
              {currentPhase && currentPhase < 3 && (
                <button
                  onClick={() => doAction('next_phase')}
                  disabled={processing}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <SkipForward className="w-5 h-5" />
                  {processing ? 'Processing...' : `Next Phase (Phase ${currentPhase + 1})`}
                </button>
              )}
              <button
                onClick={() => doAction('stop')}
                disabled={processing}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Power className="w-5 h-5" />
                Stop Competition
              </button>
            </>
          )}
        </div>

        {message && (
          <div className="mt-3 p-2 text-sm bg-green-50 text-green-800 rounded-lg">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}