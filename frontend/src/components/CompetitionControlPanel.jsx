import { useState, useEffect } from 'react';
import { Power, Clock, Calendar, Save, AlertCircle, Loader } from 'lucide-react';
import api from '../services/api';

export default function CompetitionControlPanel() {
  const [isActive, setIsActive] = useState(false);
  const [phaseName, setPhaseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await api.get('/judge/competition-status');
      setIsActive(res.data.is_active);
      setPhaseName(res.data.phase_name || '');
    } catch (error) {
      console.error('Failed to load competition status');
    } finally {
      setLoading(false);
    }
  };

  const toggleCompetition = async () => {
    setToggling(true);
    setMessage('');
    try {
      const action = isActive ? 'stop' : 'start';
      const res = await api.post('/judge/competition-control', { action });
      setIsActive(res.data.is_active);
      setPhaseName(res.data.phase_name || '');
      setMessage(isActive ? 'Competition stopped' : 'Competition started!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to toggle competition');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Competition Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold">Competition Status</h3>
            <p className="text-sm text-gray-600 mt-1">Control the competition state</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold ${
            isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg">
          {loading ? (
            <div className="flex items-center gap-3"><Loader className="w-5 h-5 animate-spin" /> Loading...</div>
          ) : (
            <>
          <Power className={`w-8 h-8 ${isActive ? 'text-green-600' : 'text-red-600'}`} />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {isActive ? 'Competition is Running' : 'Competition is Stopped'}
            </p>
            <p className="text-sm text-gray-600">
              {isActive
                ? 'Players can submit answers and view challenges'
                : 'Players cannot access challenges or submit answers'}
            </p>
            {phaseName && <p className="text-xs text-blue-600 mt-1">Current Phase: {phaseName}</p>}
          </div>
          <button
            onClick={toggleCompetition}
            disabled={toggling}
            className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'} flex items-center gap-2`}
          >
            <Power className="w-5 h-5" />
            {toggling ? 'Processing...' : isActive ? 'Stop Competition' : 'Start Competition'}
          </button>
            </>
          )}
        </div>
        {message && (
          <div className={`mt-2 p-2 text-sm rounded-lg ${
            message.includes('successfully') || message.includes('started') || message.includes('stopped')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Time Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold">Time Configuration</h3>
            <p className="text-sm text-gray-600">Set competition start and end times</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: {new Date(startTime).toLocaleString('en-US')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: {new Date(endTime).toLocaleString('en-US')}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              Duration: {Math.round((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60 * 24))} days
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('success')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <p className="font-semibold text-gray-900">Reset All Progress</p>
            <p className="text-sm text-gray-600 mt-1">Clear all submissions</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <p className="font-semibold text-gray-900">Export Results</p>
            <p className="text-sm text-gray-600 mt-1">Download CSV report</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <p className="font-semibold text-gray-900">Backup Database</p>
            <p className="text-sm text-gray-600 mt-1">Create backup file</p>
          </button>
        </div>
      </div>
    </div>
  );
}
