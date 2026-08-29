import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, RefreshCw, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import api from '../services/api';

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([
    { username: '', password: '' },
    { username: '', password: '' },
    { username: '', password: '' },
    { username: '', password: '' },
    { username: '', password: '' }
  ]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teams');
      setTeams(response.data.teams);
    } catch (error) {
      console.error('Failed to load teams:', error);
      showMessage('error', 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const toggleTeamExpansion = (teamId) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    // Validate
    if (!teamName.trim()) {
      showMessage('error', 'Team name is required');
      return;
    }

    const allMembers = members.filter(m => m.username.trim() && m.password.trim());
    if (allMembers.length !== 5) {
      showMessage('error', 'All 5 member accounts must be filled');
      return;
    }

    try {
      setCreating(true);
      await api.post('/teams/create', {
        team_name: teamName,
        members: allMembers
      });

      showMessage('success', `Team "${teamName}" created successfully!`);
      setShowCreateForm(false);
      resetForm();
      await loadTeams();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setTeamName('');
    setMembers([
      { username: '', password: '' },
      { username: '', password: '' },
      { username: '', password: '' },
      { username: '', password: '' },
      { username: '', password: '' }
    ]);
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!confirm(`Are you sure you want to delete team "${teamName}" and all its data? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/teams/${teamId}`);
      showMessage('success', `Team "${teamName}" deleted successfully`);
      await loadTeams();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to delete team');
    }
  };

  const handleResetUser = async (userId, username) => {
    if (!confirm(`Reset all progress for user "${username}"?`)) {
      return;
    }

    try {
      await api.post(`/teams/reset-user/${userId}`);
      showMessage('success', `Progress reset for ${username}`);
      await loadTeams();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to reset user');
    }
  };

  const handleResetTeam = async (teamId, teamName) => {
    if (!confirm(`Reset all progress for team "${teamName}" (all members)? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.post(`/teams/reset-team/${teamId}`);
      showMessage('success', `All progress reset for team "${teamName}"`);
      await loadTeams();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to reset team');
    }
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreateForm ? 'Cancel' : 'Create Team'}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Create Team Form */}
      {showCreateForm && (
        <div className="card">
          <form onSubmit={handleCreateTeam} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="input w-full"
                placeholder="e.g., Alpha Team"
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Team Members (5)</h3>
              {members.map((member, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member {index + 1} Username *
                    </label>
                    <input
                      type="text"
                      value={member.username}
                      onChange={(e) => updateMember(index, 'username', e.target.value)}
                      className="input w-full"
                      placeholder={`member${index + 1}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="text"
                      value={member.password}
                      onChange={(e) => updateMember(index, 'password', e.target.value)}
                      className="input w-full"
                      placeholder="password"
                      required
                    />
                  </div>
                </div>
              ))}
              <p className="text-sm text-gray-600">
                In Phase 3 (Incident Response), all 5 members log in with their own accounts and collaborate on the same IR scenario.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {creating ? 'Creating...' : 'Create Team'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams List */}
      <div className="space-y-4">
        {teams.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No teams created yet</p>
            <p className="text-gray-400 text-sm mt-2">Click "Create Team" to add your first team</p>
          </div>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => toggleTeamExpansion(team.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedTeams.has(team.id) ?
                      <ChevronUp className="w-5 h-5 text-gray-600" /> :
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    }
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{team.team_name}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {team.team_code}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{team.member_count} members</span>
                      <span>•</span>
                      <span className="text-xs text-gray-500">Created: {new Date(team.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResetTeam(team.id, team.team_name)}
                    className="btn btn-secondary flex items-center gap-2 text-sm"
                    title="Reset all progress for this team"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Team
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id, team.team_name)}
                    className="btn btn-danger flex items-center gap-2 text-sm"
                    title="Delete team"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded Team Members - will be loaded via API when expanded */}
              {expandedTeams.has(team.id) && (
                <TeamMembersList
                  teamId={team.id}
                  onResetUser={handleResetUser}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Separate component for loading team member details
function TeamMembersList({ teamId, onResetUser }) {
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamDetails();
  }, [teamId]);

  const loadTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teams/${teamId}`);
      setTeamDetails(response.data.team);
    } catch (error) {
      console.error('Failed to load team details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center">Loading members...</p>
      </div>
    );
  }

  if (!teamDetails) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Team Statistics */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{teamDetails.total_points}</p>
          <p className="text-sm text-gray-600">Total Points</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{teamDetails.solved_count}</p>
          <p className="text-sm text-gray-600">Solved Challenges</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">{teamDetails.members.length}</p>
          <p className="text-sm text-gray-600">Team Members</p>
        </div>
      </div>

      {/* Team Members */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Team Members</h4>
        <div className="space-y-2">
          {teamDetails.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {member.member_number}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{member.username}</p>
                  <p className="text-sm text-gray-600">
                    {member.submissions_count} submissions • {member.total_points} points
                  </p>
                </div>
              </div>
              <button
                onClick={() => onResetUser(member.id, member.username)}
                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
