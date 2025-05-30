import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 404 Animation */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="text-8xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              404
            </div>
            <div className="w-24 h-1 bg-blue-600 dark:bg-blue-400 mx-auto rounded-full"></div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Page Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              The page you're looking for doesn't exist or has been moved. 
              This could be due to a mistyped URL or an outdated link.
            </p>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-800 dark:text-red-300">
                CONFIDENTIAL SYSTEM
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-xs text-red-700 dark:text-red-400">
                Access attempt logged
              </span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="space-y-4"
          >
            <Link
              to="/"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Homepage</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </motion.div>

          {/* Additional Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Looking for something specific?
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                to="/about"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                About
              </Link>
              <Link
                to="/projects"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Projects
              </Link>
              <Link
                to="/resume"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Resume
              </Link>
              <Link
                to="/contact"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Contact
              </Link>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-8 text-xs text-gray-400 dark:text-gray-600"
          >
            <p>CONFIDENTIAL - Portfolio Website</p>
            <p>© 2024 Suyash Mishra. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
