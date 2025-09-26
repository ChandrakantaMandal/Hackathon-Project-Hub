import React, { useState } from 'react';
import LoadingSpinner, { LoadingPage, SkeletonCard } from '../common/LoadingSpinner';
import Button from '../common/Button';

const LoaderDemo = () => {
  const [showFullPage, setShowFullPage] = useState(false);
  const [currentVariant, setCurrentVariant] = useState('dots');
  const [currentSize, setCurrentSize] = useState('medium');

  const variants = ['dots', 'ring', 'squares', 'orb'];
  const sizes = ['small', 'medium', 'large', 'xl'];

  if (showFullPage) {
    return (
      <LoadingPage 
        variant={currentVariant}
        title="Loading Demo"
        subtitle="This is a beautiful full-page loader"
        showLogo={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Modern Loader Components
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-lg">
            Beautiful, animated loaders for your modern web application
          </p>
        </div>

        <div className="grid gap-8">
          {/* Loader Variants Demo */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">
              Loader Variants
            </h2>
            
            <div className="flex flex-wrap gap-4 mb-8">
              {variants.map((variant) => (
                <Button
                  key={variant}
                  variant={currentVariant === variant ? 'primary' : 'secondary'}
                  onClick={() => setCurrentVariant(variant)}
                  className="capitalize"
                >
                  {variant}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {sizes.map((size) => (
                <div key={size} className="text-center p-6 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4 capitalize">
                    {size}
                  </h3>
                  <div className="flex justify-center">
                    <LoadingSpinner 
                      size={size} 
                      variant={currentVariant}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Variants Showcase */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">
              All Variants (Large Size)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {variants.map((variant) => (
                <div key={variant} className="text-center p-6 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4 capitalize">
                    {variant}
                  </h3>
                  <div className="flex justify-center mb-4">
                    <LoadingSpinner 
                      size="large" 
                      variant={variant}
                    />
                  </div>
                  <div className="flex justify-center">
                    <LoadingSpinner 
                      size="medium" 
                      variant={variant}
                      text={`Loading ${variant}...`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton Cards Demo */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">
              Skeleton Loaders
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>

          {/* Full Page Demo Button */}
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              Full Page Loader
            </h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              Experience the full-page loader with beautiful animations and glassmorphism effects.
            </p>
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  setShowFullPage(true);
                  // Auto hide after 5 seconds for demo
                  setTimeout(() => setShowFullPage(false), 5000);
                }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Show Full Page Loader (5s)
              </Button>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">
              Usage Examples
            </h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Basic Spinner
                </h3>
                <code className="text-sm text-purple-600 dark:text-purple-400">
                  {`<LoadingSpinner size="medium" variant="dots" />`}
                </code>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Spinner with Text
                </h3>
                <code className="text-sm text-purple-600 dark:text-purple-400">
                  {`<LoadingSpinner variant="orb" text="Loading..." />`}
                </code>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Full Page Loader
                </h3>
                <code className="text-sm text-purple-600 dark:text-purple-400">
                  {`<LoadingPage variant="orb" title="Loading..." showLogo={true} />`}
                </code>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Skeleton Card
                </h3>
                <code className="text-sm text-purple-600 dark:text-purple-400">
                  {`<SkeletonCard className="w-full max-w-md" />`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoaderDemo;