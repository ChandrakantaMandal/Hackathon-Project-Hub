import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SubmissionModal = ({ isOpen, onClose, project, onSubmissionSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await api.post('/submissions', {
        projectId: project._id,
        ...data,
        techStack: data.techStack ? data.techStack.split(',').map(t => t.trim()) : []
      });
      
      if (response.data.success) {
        toast.success('Project submitted successfully!');
        if (onSubmissionSuccess) {
          onSubmissionSuccess();
        }
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Project">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Live Demo Link *</label>
          <input
            {...register('liveLink', { required: 'Live demo link is required' })}
            type="url"
            className="input-glass"
            placeholder="https://your-project-demo.com"
          />
          {errors.liveLink && <p className="text-red-400 text-sm mt-1">{errors.liveLink.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">GitHub Repository *</label>
          <input
            {...register('githubLink', { required: 'GitHub link is required' })}
            type="url"
            className="input-glass"
            placeholder="https://github.com/username/repo"
          />
          {errors.githubLink && <p className="text-red-400 text-sm mt-1">{errors.githubLink.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Project Description</label>
          <textarea
            {...register('description')}
            className="input-glass h-24"
            placeholder="Describe your project submission..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tech Stack</label>
          <input
            {...register('techStack')}
            className="input-glass"
            placeholder="React, Node.js, MongoDB (comma-separated)"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" loading={loading} className="flex-1">
            Submit Project
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmissionModal;



