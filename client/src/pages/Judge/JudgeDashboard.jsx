import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrophyIcon, 
  StarIcon, 
  CodeBracketIcon,
  GlobeAltIcon,
  GiftIcon,
  ArrowRightOnRectangleIcon,
  FolderIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';


const JudgeDashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scores, setScores] = useState({
    innovation: '',
    technical: '',
    design: '',
    presentation: '',
    overall: '',
    feedback: ''
  });

  const judge = JSON.parse(localStorage.getItem('judge') || '{}');

  const badges = [
    { type: 'first-riser', name: 'The First Riser', description: 'First team to submit' },
    { type: 'last-arrival', name: 'The Last Arrival', description: 'Last team to submit' },
    { type: 'innovation-master', name: 'Innovation Master', description: 'Most innovative solution' },
    { type: 'tech-wizard', name: 'Tech Wizard', description: 'Best technical implementation' },
    { type: 'design-guru', name: 'Design Guru', description: 'Outstanding UI/UX design' },
    { type: 'peoples-choice', name: "People's Choice", description: 'Most popular project' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('judgeToken');
    localStorage.removeItem('judge');
    toast.success('Logged out successfully');
    navigate('/judge/login');
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('judgeToken');
      if (!token) {
        toast.error('No judge token found');
        navigate('/judge/login');
        return;
      }

     
      const res = await api.get('/judge/submissions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const submissionsData = res.data.data?.submissions || [];
      setSubmissions(submissionsData);
      
    } catch (error) {
      console.error('Fetch submissions error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('judgeToken');
        localStorage.removeItem('judge');
        navigate('/judge/login');
      } else {
        toast.error('Failed to fetch submissions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScore = async () => {
    try {
      const token = localStorage.getItem('judgeToken');

      // Convert string inputs to numbers and clamp between 0-10
      const toNum = (v) => {
        const n = Number(v);
        if (Number.isNaN(n)) return 0;
        return Math.min(10, Math.max(0, n));
      };

      const payload = {
        innovation: toNum(scores.innovation),
        technical: toNum(scores.technical),
        design: toNum(scores.design),
        presentation: toNum(scores.presentation),
        overall: toNum(scores.overall),
        feedback: scores.feedback || ''
      };

      await api.post(`/judge/submissions/${selectedSubmission._id}/score`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Score submitted successfully');
      setShowScoreModal(false);
      fetchSubmissions();
    } catch (error) {
      toast.error('Failed to submit score');
    }
  };

  const handleAwardBadge = async (badgeType) => {
    try {
      const token = localStorage.getItem('judgeToken');
      const badge = badges.find(b => b.type === badgeType);
      await api.post(`/judge/submissions/${selectedSubmission._id}/badge`, badge, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Badge awarded successfully');
      setShowBadgeModal(false);
      fetchSubmissions();
    } catch (error) {
      toast.error('Failed to award badge');
    }
  };

  const handleRemoveBadge = async (submissionId, badgeIndex) => {
    try {
      const token = localStorage.getItem('judgeToken');
      await api.delete(`/judge/submissions/${submissionId}/badge/${badgeIndex}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Badge removed successfully');
      fetchSubmissions();
    } catch (error) {
      toast.error('Failed to remove badge');
    }
  };

  const getJudgeScore = (submission) => {
    return submission.scores?.find(score => score.judge._id === judge._id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const filteredSubmissions = submissions.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const haystack = [
      s.project?.title,
      s.project?.description,
      s.team?.name,
      s.submittedBy?.name,
      s.description,
      ...(s.techStack || []),
      ...((s.project?.tags) || []),
      s.githubLink,
      s.liveLink,
    ]
      .filter(Boolean)
      .map((v) => String(v).toLowerCase());
    return haystack.some((part) => part.includes(q));
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Judge Dashboard</h1>
            <p className="text-gray-300">Welcome back, {judge.name}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 border-white/30 text-white hover:bg-white/10"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </Button>
        </div>

        {/* Judge Stats */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-purple-500/30 rounded-lg">
                  <FolderIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-white">{submissions.length}</p>
                  <p className="text-sm text-gray-300">Total Submissions</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-green-500/30 rounded-lg">
                  <DocumentCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-white">
                    {submissions.filter(s => s.scores?.some(score => score.judge?._id === judge._id)).length}
                  </p>
                  <p className="text-sm text-gray-300">Scored by You</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-blue-500/30 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-white">
                    {new Set(submissions.map(s => s.team?._id)).size}
                  </p>
                  <p className="text-sm text-gray-300">Teams</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-yellow-500/30 rounded-lg">
                  <GiftIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-white">
                    {submissions.reduce((total, s) => total + (s.badges?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-300">Badges Awarded</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-3xl">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search submitted projects (title, team, tech, tags, submitter, links)"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {!loading && (submissions.length === 0) ? (
            <div className="text-center py-12">
              <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg mb-2">No submissions yet</p>
              <p className="text-gray-400 text-sm">
                Submissions will appear here once teams start submitting their projects
              </p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg mb-2">No results found for "{searchTerm}"</p>
              <p className="text-gray-400 text-sm">Try another search term.</p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => {
              const judgeScore = getJudgeScore(submission);

              return (
                <motion.div
                  key={submission._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {submission.project?.title || submission.title || 'Untitled Project'}
                      </h3>
                      <p className="text-gray-300 mb-2">
                        Team: {submission.team?.name || 'Unknown Team'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Submitted by: {submission.submittedBy?.name || 'Unknown User'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Submitted on {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {submission.liveLink && (
                        <Button
                          size="small"
                          onClick={() => window.open(submission.liveLink, '_blank')}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <GlobeAltIcon className="w-4 h-4 mr-1" />
                          Live Demo
                        </Button>
                      )}
                      {submission.githubLink && (
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => window.open(submission.githubLink, '_blank')}
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <CodeBracketIcon className="w-4 h-4 mr-1" />
                          GitHub
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300 mb-2">{submission.project?.description || submission.description}</p>
                  </div>

                  {submission.techStack?.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {submission.techStack.map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white/10 text-white text-xs rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show awarded badges */}
                  {submission.badges?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Awarded Badges:</h4>
                      <div className="flex flex-wrap gap-2">
                        {submission.badges.map((badge, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30 flex items-center gap-1 group relative"
                          >
                            <GiftIcon className="w-3 h-3" />
                            {badge.name}
                            <button
                              onClick={() => handleRemoveBadge(submission._id, index)}
                              className="ml-1 w-4 h-4 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-all duration-200"
                              title="Remove badge"
                            >
                              <span className="text-xs font-bold">×</span>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          if (judgeScore) {
                            setScores({
                              innovation: String(judgeScore.innovation ?? ''),
                              technical: String(judgeScore.technical ?? ''),
                              design: String(judgeScore.design ?? ''),
                              presentation: String(judgeScore.presentation ?? ''),
                              overall: String(judgeScore.overall ?? ''),
                              feedback: judgeScore.feedback || ''
                            });
                          } else {
                            setScores({
                              innovation: '',
                              technical: '',
                              design: '',
                              presentation: '',
                              overall: '',
                              feedback: ''
                            });
                          }
                          setShowScoreModal(true);
                        }}
                      >
                        <StarIcon className="w-4 h-4 mr-1" />
                        {judgeScore ? 'Update Score' : 'Score Project'}
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowBadgeModal(true);
                        }}
                      >
                        <GiftIcon className="w-4 h-4 mr-1" />
                        Award Badge
                      </Button>
                    </div>
                    {judgeScore && (
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          Your Score: {((judgeScore.innovation + judgeScore.technical + judgeScore.design + judgeScore.presentation + judgeScore.overall) / 5).toFixed(1)}/10
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Score Modal */}
        {showScoreModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-md border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Score Project</h3>
              <div className="space-y-4">
                {['innovation', 'technical', 'design', 'presentation', 'overall'].map((criteria) => (
                  <div key={criteria}>
                    <label className="block text-gray-300 text-sm mb-1 capitalize">
                      {criteria} (0-10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={scores[criteria]}
                      onChange={(e) => setScores(prev => ({
                        ...prev,
                        [criteria]: e.target.value
                      }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Feedback</label>
                  <textarea
                    value={scores.feedback}
                    onChange={(e) => setScores(prev => ({ ...prev, feedback: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white h-20"
                    placeholder="Optional feedback..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleScore} className="flex-1">
                  Submit Score
                </Button>
                <Button variant="outline" onClick={() => setShowScoreModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Badge Modal */}
        {showBadgeModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-md border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Award Badge</h3>
              <div className="space-y-3">
                {badges.map((badge) => (
                  <button
                    key={badge.type}
                    onClick={() => handleAwardBadge(badge.type)}
                    className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-colors"
                  >
                    <div className="font-medium text-white">{badge.name}</div>
                    <div className="text-sm text-gray-300">{badge.description}</div>
                  </button>
                ))}
              </div>
              <Button variant="outline" onClick={() => setShowBadgeModal(false)} className="w-full mt-4">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeDashboard;
















