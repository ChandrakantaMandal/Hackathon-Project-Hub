import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreateTeamModal = ({ isOpen, onClose, onTeamCreated }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic info, 2: Add members
  const [teamData, setTeamData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await api.post('/teams', data);
      
      if (response.data.success) {
        setTeamData(response.data.data.team);
        setStep(2); // Move to member selection
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query || query.trim().length < 2) {
      setUsers([]);
      return;
    }

    try {
      setSearching(true);
      const response = await api.get(`/teams/users/search?q=${encodeURIComponent(query)}&teamId=${teamData?._id}`);
      
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Search users error:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleUserSelect = (user) => {
    if (!selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery('');
    setUsers([]);
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
  };

  const handleAddMembers = async () => {
    if (!teamData || selectedUsers.length === 0) {
      // Skip if no members selected
      handleFinish();
      return;
    }

    try {
      setLoading(true);
      
      // Add all selected users to the team
      for (const user of selectedUsers) {
        await api.post(`/teams/${teamData._id}/members`, {
          userId: user._id,
          role: 'member'
        });
      }
      
      toast.success(`Team created with ${selectedUsers.length} members!`);
      handleFinish();
    } catch (error) {
      toast.error('Team created but failed to add some members');
      handleFinish();
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onTeamCreated(teamData);
    handleClose();
  };

  const handleClose = () => {
    reset();
    setStep(1);
    setTeamData(null);
    setSelectedUsers([]);
    setSearchQuery('');
    setUsers([]);
    onClose();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchUsers(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? "Create New Team" : "Add Team Members"}
      size="medium"
    >
      {step === 1 ? (
        // Step 1: Basic team info
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Team Name *
            </label>
            <input
              {...register('name', { 
                required: 'Team name is required',
                minLength: { value: 2, message: 'Team name must be at least 2 characters' },
                maxLength: { value: 50, message: 'Team name cannot exceed 50 characters' }
              })}
              type="text"
              id="name"
              className="input-glass"
              placeholder="Enter team name"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description', {
                maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
              })}
              id="description"
              rows={3}
              className="input-glass resize-none"
              placeholder="Describe your team and its goals (optional)"
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Next: Add Members
            </Button>
          </div>
        </form>
      ) : (
        // Step 2: Add members
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="input-glass"
              placeholder="Search by name or email..."
            />
          </div>

          {/* Search Results */}
          {users.length > 0 && (
            <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8B5CF6&color=ffffff&size=128&bold=true`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Members ({selectedUsers.length})
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8B5CF6&color=ffffff&size=128&bold=true`}
                        alt={user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <button
                      onClick={() => handleUserRemove(user._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleFinish}
              className="flex-1"
            >
              Skip & Finish
            </Button>
            <Button
              onClick={handleAddMembers}
              loading={loading}
              className="flex-1"
            >
              Create Team
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CreateTeamModal;


