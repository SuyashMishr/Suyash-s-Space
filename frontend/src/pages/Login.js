import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  const { login, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';
  const maxAttempts = 3;
  const lockDuration = 300; // 5 minutes in seconds

  useEffect(() => {
    // Check if account is locked
    const lockData = localStorage.getItem('login-lock');
    if (lockData) {
      const { timestamp, attempts: savedAttempts } = JSON.parse(lockData);
      const timePassed = (Date.now() - timestamp) / 1000;
      
      if (timePassed < lockDuration && savedAttempts >= maxAttempts) {
        setIsLocked(true);
        setLockTimeRemaining(Math.ceil(lockDuration - timePassed));
        setAttempts(savedAttempts);
      } else if (timePassed >= lockDuration) {
        // Lock expired, reset
        localStorage.removeItem('login-lock');
        setAttempts(0);
      } else {
        setAttempts(savedAttempts);
      }
    }
  }, []);

  useEffect(() => {
    // Countdown timer for lock
    if (isLocked && lockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            localStorage.removeItem('login-lock');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockTimeRemaining]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error(`Account locked. Try again in ${Math.ceil(lockTimeRemaining / 60)} minutes.`);
      return;
    }

    const result = await login(formData);
    
    if (!result.success) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        setIsLocked(true);
        setLockTimeRemaining(lockDuration);
        localStorage.setItem('login-lock', JSON.stringify({
          timestamp: Date.now(),
          attempts: newAttempts
        }));
        toast.error(`Too many failed attempts. Account locked for ${lockDuration / 60} minutes.`);
      } else {
        const remainingAttempts = maxAttempts - newAttempts;
        toast.error(`Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`);
        localStorage.setItem('login-lock', JSON.stringify({
          timestamp: Date.now(),
          attempts: newAttempts
        }));
      }
    } else {
      // Reset attempts on successful login
      setAttempts(0);
      localStorage.removeItem('login-lock');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4"
          >
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Restricted area - Authorized personnel only
          </p>
          
          {/* Security Warning */}
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-300 font-medium">
                CONFIDENTIAL SYSTEM
              </span>
            </div>
            <p className="text-xs text-red-700 dark:text-red-400 mt-1">
              All access attempts are logged and monitored
            </p>
          </div>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8"
        >
          {isLocked ? (
            <div className="text-center">
              <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Account Temporarily Locked
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Too many failed login attempts. Please wait before trying again.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-300 font-mono text-lg">
                  {formatTime(lockTimeRemaining)}
                </p>
                <p className="text-red-600 dark:text-red-400 text-sm">
                  Time remaining
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Attempts Warning */}
              {attempts > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-300">
                      {maxAttempts - attempts} attempt{maxAttempts - attempts !== 1 ? 's' : ''} remaining
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This is a secure area. Unauthorized access is prohibited.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
