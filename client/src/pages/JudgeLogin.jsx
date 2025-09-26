import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const JudgeLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    judgeCode: '',
    specialization: 'general'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/judge/login' : '/judge/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;
        
      const res = await api.post(endpoint, payload);
      
      if (res.data.success) {
        localStorage.setItem('judgeToken', res.data.data.token);
        localStorage.setItem('judge', JSON.stringify(res.data.data.judge));
        toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
        navigate('/judge/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
      const message = error.response?.data?.message || 'Authentication failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      judgeCode: '',
      specialization: 'general'
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Judge Portal
          </h1>
          <p className="text-gray-300">
            {isLogin ? 'Sign in to your judge account' : 'Create your judge account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-glass w-full"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Judge Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.judgeCode}
                  onChange={(e) => setFormData({ ...formData, judgeCode: e.target.value })}
                  className="input-glass w-full"
                  placeholder="Enter judge access code (e.g., JUDGE2024)"
                />
                <p className="text-xs text-gray-300 mt-1">
                  Contact admin for your judge access code
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Specialization
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="input-glass w-full"
                >
                  <option value="general">General</option>
                  <option value="web">Web Development</option>
                  <option value="mobile">Mobile Development</option>
                  <option value="ai">AI/ML</option>
                  <option value="blockchain">Blockchain</option>
                  <option value="iot">IoT</option>
                  <option value="game">Game Development</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-glass w-full"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-glass w-full pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-300 mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            {isLogin ? 'Sign In' : 'Create Judge Account'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={toggleMode}
            className="block w-full text-purple-400 hover:text-purple-300 text-sm transition-colors"
          >
            {isLogin 
              ? "Don't have a judge account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="block w-full text-black hover:text-white text-sm underline underline-offset-4"
          >
            ← Go to Landing Page
          </button>
        </div>

        {!isLogin && (
          <div className="mt-4 p-4 bg-blue-600/20 rounded-lg">
            <p className="text-xs text-blue-300">
              <strong>Note:</strong> You need a valid judge code to register. 
              Contact the hackathon organizers to get your judge access code.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default JudgeLogin;



