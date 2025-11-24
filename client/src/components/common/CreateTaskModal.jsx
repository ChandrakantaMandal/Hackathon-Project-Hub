import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import Button from './Button';

const CreateTaskModal = ({ isOpen, onClose, projectId, members, onTaskCreated }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      priority: 'medium',
      status: 'todo'
    }
  });

  const onSubmit = async (data) => {
    try {
      const taskData = {
        title: data.title,
        description: data.description || '',
        priority: data.priority || 'medium',
        project: projectId,
        assignedTo: data.assignedTo || null,
        dueDate: data.dueDate || null,
        estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : 0
      };

      
      Object.keys(taskData).forEach(key => {
        if (taskData[key] === null || taskData[key] === '') {
          delete taskData[key];
        }
      });

      console.log('Sending task data:', taskData); // Debug log
      
      const response = await api.post('/tasks', taskData);
      
      if (response.data.success) {
        onTaskCreated(response.data.data.task);
        reset();
        onClose();
        toast.success('Task created successfully! ✨');
      }
    } catch (error) {
      console.error('Task creation error:', error);
      console.error('Error response:', error.response?.data); // Debug log
      toast.error(error.response?.data?.message || 'Failed to create task ❌');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Task" size="large">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input 
            {...register('title', { 
              required: 'Title is required',
              minLength: { value: 2, message: 'Title must be at least 2 characters' },
              maxLength: { value: 100, message: 'Title must be less than 100 characters' }
            })}
            className="input-glass"
            placeholder="Enter task title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea 
            {...register('description', {
              maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
            })}
            className="input-glass"
            placeholder="Enter task description"
            rows="3"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select 
              {...register('priority')}
              className="input-glass"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To
            </label>
            <select 
              {...register('assignedTo')}
              className="input-glass"
            >
              <option value="">Unassigned</option>
              {members?.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input 
              {...register('dueDate')}
              type="date"
              className="input-glass"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Hours
            </label>
            <input 
              {...register('estimatedHours', {
                min: { value: 0, message: 'Hours must be positive' }
              })}
              type="number"
              min="0"
              step="0.5"
              className="input-glass"
              placeholder="0"
            />
            {errors.estimatedHours && (
              <p className="mt-1 text-sm text-red-600">{errors.estimatedHours.message}</p>
            )}
          </div>
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
            className="flex-1"
          >
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;




