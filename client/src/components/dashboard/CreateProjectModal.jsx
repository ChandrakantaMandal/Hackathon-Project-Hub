import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { PROJECT_CATEGORIES } from '../../utils/constants';
import api from '../../utils/api'; 
import toast from 'react-hot-toast';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated, teams }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const formattedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };
      
      const response = await api.post('/projects', formattedData);
      
      if (response.data.success) {
        onProjectCreated(response.data.data.project);
        reset();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
      size="large"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {teams.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700 text-sm">
              You need to create or join a team before you can create a project.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              {...register('title', { 
                required: 'Project title is required',
                minLength: { value: 2, message: 'Title must be at least 2 characters' },
                maxLength: { value: 100, message: 'Title cannot exceed 100 characters' }
              })}
              type="text"
              id="title"
              className="input-glass"
              placeholder="Enter project title"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-2">
              Team *
            </label>
            <select
              {...register('teamId', { required: 'Please select a team' })}
              id="teamId"
              className="input-glass"
              disabled={teams.length === 0}
            >
              <option value="">Select a team</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
            {errors.teamId && (
              <p className="mt-2 text-sm text-red-600">{errors.teamId.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Short Description
          </label>
          <input
            {...register('shortDescription', {
              maxLength: { value: 200, message: 'Short description cannot exceed 200 characters' }
            })}
            type="text"
            id="shortDescription"
            className="input-glass"
            placeholder="Brief description for project cards"
          />
          {errors.shortDescription && (
            <p className="mt-2 text-sm text-red-600">{errors.shortDescription.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Full Description *
          </label>
          <textarea
            {...register('description', { 
              required: 'Description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters' },
              maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters' }
            })}
            id="description"
            rows={4}
            className="input-glass resize-none"
            placeholder="Detailed project description..."
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              {...register('category')}
              id="category"
              className="input-glass"
            >
              {PROJECT_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              {...register('dueDate')}
              type="date"
              id="dueDate"
              className="input-glass"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            {...register('tags')}
            type="text"
            id="tags"
            className="input-glass"
            placeholder="Comma-separated tags (e.g., react, nodejs, ai)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple tags with commas
          </p>
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
            disabled={teams.length === 0}
            className="flex-1"
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;