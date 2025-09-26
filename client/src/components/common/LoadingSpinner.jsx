import React from 'react';
import { motion } from 'framer-motion';

// Modern Loader Variants
const LoadingSpinner = ({ size = 'medium', variant = 'dots', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const dotSizes = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4', 
    xl: 'w-5 h-5'
  };

  // Pulsing Dots Loader
  const PulsingDots = () => (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${dotSizes[size]} bg-gradient-to-r from-purple-500 to-blue-500 rounded-full`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  // Spinning Ring Loader
  const SpinningRing = () => (
    <div className={`${className} flex items-center justify-center`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-gray-200 dark:border-slate-600 rounded-full relative`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="absolute inset-0 border-2 border-transparent border-t-purple-500 border-r-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  );

  // Morphing Squares Loader
  const MorphingSquares = () => (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className={`${dotSizes[size]} bg-gradient-to-br from-purple-400 to-blue-600 rounded-sm`}
          animate={{
            scale: [1, 0.8, 1],
            rotate: [0, 180, 360],
            borderRadius: ['2px', '50%', '2px']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  // Glowing Orb Loader
  const GlowingOrb = () => (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-blue-500 rounded-full relative`}
        animate={{
          scale: [1, 1.2, 1],
          boxShadow: [
            '0 0 0 0 rgba(139, 92, 246, 0.4)',
            '0 0 0 20px rgba(139, 92, 246, 0)',
            '0 0 0 0 rgba(139, 92, 246, 0)'
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div
          className="absolute inset-2 bg-white/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  );

  const variants = {
    dots: PulsingDots,
    ring: SpinningRing,
    squares: MorphingSquares,
    orb: GlowingOrb
  };

  const LoaderComponent = variants[variant] || PulsingDots;

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <LoaderComponent />
        <motion.p 
          className="text-sm font-medium text-gray-600 dark:text-slate-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.p>
      </div>
    );
  }

  return <LoaderComponent />;
};

// Full Page Loader
const LoadingPage = ({ 
  variant = 'orb', 
  title = 'Loading...', 
  subtitle = 'Please wait while we set things up for you.',
  showLogo = false 
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="glass-card p-12 max-w-md w-full mx-4 text-center">
        {showLogo && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
        )}
        
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <LoadingSpinner size="xl" variant={variant} />
        </motion.div>
        
        <motion.h2
          className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {title}
        </motion.h2>
        
        <motion.p
          className="text-gray-600 dark:text-slate-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {subtitle}
        </motion.p>
      </div>
      
      {/* Background Animation */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-300/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -80, -20],
              opacity: [0, 1, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Card Skeleton Loader
const SkeletonCard = ({ className = '' }) => (
  <div className={`glass-card p-6 ${className}`}>
    <div className="animate-pulse space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
      </div>
      <div className="flex space-x-2">
        <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
      </div>
    </div>
  </div>
);

export default LoadingSpinner;
export { LoadingPage, SkeletonCard };
