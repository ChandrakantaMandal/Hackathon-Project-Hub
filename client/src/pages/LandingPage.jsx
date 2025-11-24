import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  RocketLaunchIcon, 
  UsersIcon, 
  ChartBarIcon, 
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon ,
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';




const LandingPage = () => {
  const features = [
    {
      icon: UsersIcon,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with your teammates in real-time'
    },
    {
      icon: ChartBarIcon,
      title: 'Progress Tracking',
      description: 'Visual charts and analytics to track your project progress'
    },
    {
      icon: EyeIcon,
      title: 'Project Showcase',
      description: 'Display your projects in a public gallery for everyone to see'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Scored By Judge',
      description: 'Judges are score your projects and declar winners'
    },
    {
      icon: CheckBadgeIcon,
      title: 'Task Management',
      description: 'Organize and track tasks with our intuitive task board'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Launch Ready',
      description: 'Everything you need to take your hackathon project to the next level'
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
    <div className="min-h-screen bg-gray-900 py-12">
      {/* Header */}
      <motion.header 
        className="fixed top-0 inset-x-0 z-50 p-4 bg-black/30 backdrop-blur border-b border-white/10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <RocketLaunchIcon className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold gradient-text">HackHub</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/showcase" className="text-white/90 hover:text-white underline-offset-4 hover:underline transition-colors">
              Showcase
            </Link>
            <Link to="/judge/login" className="text-white/90 hover:text-white underline-offset-4 hover:underline transition-colors">
              Join as Judge
            </Link>
            <Link to="/signup">
              <Button variant="secondary" size="small">
                Sign In
              </Button>
            </Link>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center gradient-purple-blue overflow-hidden pt-24">
     <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-4 -left-4 w-72 h-72 bg-white/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute top-1/2 -right-4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
            animate={{
              x: [0, -150, 0],
              y: [0, 100, 0],
            }}
       
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
            >
              Build. Collaborate.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Showcase.
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              The ultimate platform for hackathon teams to collaborate, track progress, 
              and showcase their innovative projects to the world.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/signup">
                <Button size="large" className="text-lg px-8 py-4 shadow-2xl">
                  Get Started Free
                  <RocketLaunchIcon className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/showcase">
                <Button variant="secondary" size="large" className="text-lg px-8 py-4">
                  View Showcase
                  <EyeIcon className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to{' '}
              <span className="gradient-text">succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From ideation to implementation, our platform provides all the tools 
              your team needs to create amazing projects.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glass-card p-8 hover-lift group"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-purple-blue">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to build something amazing?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Join thousands of developers and creators who are using HackHub 
              to collaborate and showcase their projects.
            </p>
            <Link to="/signup">
              <Button 
                size="large" 
                variant="secondary"
                className="text-lg px-8 py-4 shadow-2xl"
              >
                Start Your Journey
                <RocketLaunchIcon className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
             <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <RocketLaunchIcon className="w-6 h-6 text-white" />
              <span className="text-xl font-bold text-white">HackHub</span>
            </div>
              <p className="text-gray-400">
                The future of hackathons.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              © 2024 HackHub. Built for creators, by creators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
