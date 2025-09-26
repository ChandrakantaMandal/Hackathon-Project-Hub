import React from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  FolderIcon,
  ChartBarIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const DashboardStats = ({ teams, projects }) => {
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalTasks = projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0);
  const completedTasks = projects.reduce((sum, p) => 
    sum + (p.tasks?.filter(t => t.status === 'completed').length || 0), 0
  );

  const stats = [
    {
      name: 'Teams',
      value: teams.length,
      icon: UsersIcon,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Projects',
      value: projects.length,
      icon: FolderIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Completed',
      value: completedProjects,
      icon: CheckBadgeIcon,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Tasks Done',
      value: `${completedTasks}/${totalTasks}`,
      icon: ChartBarIcon,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          variants={itemVariants}
          className="glass-card p-6 hover-lift"
        >
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 bg-gray-100 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-gray-700" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.name}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardStats;