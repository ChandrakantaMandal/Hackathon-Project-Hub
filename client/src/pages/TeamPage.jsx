import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TeamCard from '../components/dashboard/TeamCard';
import ProjectCard from '../components/dashboard/ProjectCard';
import UserSelector from '../components/dashboard/UserSelector';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';

const TeamPage = () => {
  const { teamId } = useParams();
  const { user } = useAppStore();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [removing, setRemoving] = useState(null);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError('');
      setForbidden(false);
      const res = await api.get(`/teams/${teamId}`);
      if (res.data.success) setTeam(res.data.data.team);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchTeam();
      } catch (e) {
        const status = e?.response?.status;
        const message = e?.response?.data?.message || 'Failed to load team';
        setError(message);
        if (status === 403) setForbidden(true);
      }
    };
    load();
  }, [teamId]);

  const handleJoin = async () => {
    if (!inviteCode || !inviteCode.trim()) return;
    setRegenerating(true);
    try {
      const res = await api.post(`/teams/join/${encodeURIComponent(inviteCode.trim())}`);
      if (res.data.success) {
        setInviteCode('');
        setForbidden(false);
        await fetchTeam();
      }
    } catch (e) {
      const message = e?.response?.data?.message || 'Failed to join team';
      setError(message);
    } finally {
      setRegenerating(false);
    }
  };

  const handleRegenerateInvite = async () => {
    if (!team) return;
    setRegenerating(true);
    try {
      const res = await api.post(`/teams/${team._id}/regenerate-code`);
      if (res.data.success) await fetchTeam();
    } finally {
      setRegenerating(false);
    }
  };

  const handleUserAdded = (updatedTeam) => {
    setTeam(updatedTeam);
    setShowUserSelector(false);
  };

  const handleRemoveMember = async (memberId) => {
    if (!team) return;
    setRemoving(memberId);
    try {
      const res = await api.delete(`/teams/${team._id}/members/${memberId}`);
      if (res.data.success) {
        setTeam(res.data.data.team);
        toast.success('Member removed successfully');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove member';
      toast.error(message);
    } finally {
      setRemoving(null);
    }
  };

  
  const canManageMembers = () => {
    if (!team || !user) return false;
    const member = team.members.find(m => m.user._id === user._id);
    return member && ['owner', 'admin'].includes(member.role);
  };
  
  const canManageTeam = () => {
    if (!team || !user) return false;
    const userMember = team.members?.find(m => m.user._id === user._id);
    return userMember?.role === 'owner' || userMember?.role === 'admin';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!team) {
    if (forbidden) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="glass-card p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Access denied</h3>
            <p className="text-gray-600 mb-4">You are not a member of this team. If you have an invite code, enter it below to join.</p>
            <div className="flex gap-2">
              <input
                className="input-glass flex-1"
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
              <Button onClick={handleJoin} loading={regenerating}>Join</Button>
            </div>
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="glass-card p-8 text-center max-w-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to open team</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchTeam}>Try again</Button>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
            {team.description && (
              <p className="text-gray-600 mt-2 max-w-3xl">{team.description}</p>
            )}
            {canManageTeam() && (
              <div className="mt-3 text-sm text-gray-600">
                Invite Code: <span className="font-mono">{team.inviteCode}</span>
              </div>
            )}
          </div>
          <div className="space-x-2">
            {canManageTeam() && (
              <Button onClick={handleRegenerateInvite} loading={regenerating}>
                Regenerate Code
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Members</h3>
              {canManageMembers() && (
                <Button
                  size="small"
                  onClick={() => setShowUserSelector(true)}
                >
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              )}
            </div>
            {team.members && team.members.length > 0 ? (
              <div className="space-y-3">
                {team.members.map((m, i) => (
                  <div key={m.user?._id || i} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.name || 'User')}&background=8B5CF6&color=ffffff&size=128&bold=true`}
                        alt={m.user?.name || 'Member'}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-slate-100">{m.user?.name || 'Member'}</p>
                        <p className="text-sm text-gray-600 dark:text-slate-400 capitalize">{m.role}</p>
                      </div>
                    </div>
                    {canManageMembers() && m.user?._id !== user?._id && (
                      <Button
                        size="small"
                        variant="ghost"
                        onClick={() => handleRemoveMember(m.user._id)}
                        loading={removing === m.user._id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-slate-400 mb-4">No members yet.</p>
                {canManageMembers() && (
                  <Button
                    variant="outline"
                    onClick={() => setShowUserSelector(true)}
                  >
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Add First Member
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">Projects</h3>
            {team.projects && team.projects.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {team.projects.map((p) => (
                  <ProjectCard key={p._id} project={p} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-slate-400">No projects yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">Owner</h3>
            <div className="flex items-center gap-3">
              <img
                src={team.owner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(team.owner?.name || 'User')}&background=8B5CF6&color=ffffff&size=128&bold=true`}
                alt={team.owner?.name || 'Owner'}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-slate-100">{team.owner?.name || 'Owner'}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">Owner</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">Stats</h3>
            <ul className="text-gray-700 dark:text-slate-300 space-y-1 text-sm">
              <li>Total Projects: {team.stats?.totalProjects || 0}</li>
              <li>Completed Projects: {team.stats?.completedProjects || 0}</li>
              <li>Total Tasks: {team.stats?.totalTasks || 0}</li>
              <li>Completed Tasks: {team.stats?.completedTasks || 0}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* User Selector Modal */}
      {showUserSelector && (
        <UserSelector
          teamId={team._id}
          onUserAdded={handleUserAdded}
          onClose={() => setShowUserSelector(false)}
        />
      )}
    </div>
  );
};

export default TeamPage;

