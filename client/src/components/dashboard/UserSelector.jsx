import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const UserSelector = ({ teamId, onUserAdded, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers(searchQuery);
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, teamId]);

  const searchUsers = async (query) => {
    try {
      setLoading(true);
      const response = await api.get(`/teams/users/search?q=${encodeURIComponent(query)}&teamId=${teamId}`);
      
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Search users error:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (user) => {
    try {
      setAdding(user._id);
      const response = await api.post(`/teams/${teamId}/members`, {
        userId: user._id,
        role: 'member'
      });

      if (response.data.success) {
        toast.success(`${user.name} added to team successfully!`);
        onUserAdded(response.data.data.team);
        setSearchQuery('');
        setUsers([]);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add user to team';
      toast.error(message);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Add Team Member
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="mt-4 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="small" />
              </div>
            ) : searchQuery.trim().length < 2 ? (
              <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                Type at least 2 characters to search
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                No users found
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8B5CF6&color=ffffff&size=128&bold=true`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-slate-100">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="small"
                      onClick={() => handleAddUser(user)}
                      loading={adding === user._id}
                      disabled={adding === user._id}
                    >
                      <UserPlusIcon className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserSelector;

