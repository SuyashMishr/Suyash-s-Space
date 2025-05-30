import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Settings, Database, MessageSquare, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const adminFeatures = [
    {
      icon: Database,
      title: 'Content Management',
      description: 'Manage projects, experience, and portfolio content',
      status: 'Available',
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
    },
    {
      icon: MessageSquare,
      title: 'AI Assistant Logs',
      description: 'View chatbot interactions and analytics',
      status: 'Available',
      color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Site traffic and user engagement metrics',
      status: 'Coming Soon',
      color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage admin users and permissions',
      status: 'Coming Soon',
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
    },
    {
      icon: Settings,
      title: 'System Settings',
      description: 'Configure site settings and preferences',
      status: 'Available',
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
                  CONFIDENTIAL ADMIN PANEL
                </h2>
                <p className="text-red-700 dark:text-red-400 text-sm">
                  Authorized access only. All actions are logged and monitored.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {user?.username || 'Admin'}. Manage your portfolio content and settings.
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                System Online
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">5</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Conversations</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Page Views</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">1</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Admin Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Management Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      feature.status === 'Available' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {feature.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Recent Activity
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Activity logs will appear here once the system starts tracking user interactions.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Secure admin session - All actions are logged</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
