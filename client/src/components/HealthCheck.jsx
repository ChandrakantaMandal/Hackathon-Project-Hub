import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const HealthCheck = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.get('/health');
        if (response.data?.status === 'OK') {
          setStatus('healthy');
        } else {
          setStatus('unhealthy');
          setError('Server returned unexpected response');
        }
      } catch (err) {
        setStatus('error');
        setError(err.message);
        console.error('Health check failed:', err);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (status === 'checking') return null;

  return (
    <div className={`fixed top-4 right-4 px-3 py-2 rounded-lg text-sm font-medium ${
      status === 'healthy' 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {status === 'healthy' ? '🟢 Server Online' : `🔴 Server Error: ${error}`}
    </div>
  );
};

export default HealthCheck;