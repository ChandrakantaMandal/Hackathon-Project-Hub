import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import api from '../utils/api';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage = () => {
  const { user, refreshUser, updateProfile } = useAppStore();
  const [form, setForm] = useState({ name: '', bio: '', skills: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (!user) {
          await refreshUser();
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        skills: (user.skills || []).join(', '),
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        bio: form.bio,
        avatar: form.avatar,
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      };
      await updateProfile(payload);
      await refreshUser();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" variant="orb" text="Loading your profile..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile</h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
              <input
                className="input-glass"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
              <input
                className="input-glass"
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma separated)</label>
              <input
                className="input-glass"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="react, node, mongodb"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                className="input-glass h-40"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>Save changes</Button>
            </div>
          </div>
        </form>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Teams</h3>
        {user.teams && user.teams.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.teams.map((t, index) => (
              <span key={t._id || `team-${index}-${t.name || 'unknown'}`} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">{t.name}</span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You are not a member of any teams yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;