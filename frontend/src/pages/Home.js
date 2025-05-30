import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, MessageCircle, Code, Brain, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import ChatBot from '../components/ChatBot/ChatBot';

const Home = () => {
  const [generalInfo, setGeneralInfo] = useState(null);
  const [showChatBot, setShowChatBot] = useState(false);

  useEffect(() => {
    // Load general info from data file
    fetch('/data/general_info.json')
      .then(response => response.json())
      .then(data => setGeneralInfo(data))
      .catch(error => console.error('Error loading general info:', error));
  }, []);

  const features = [
    {
      icon: Code,
      title: 'Full-Stack Development',
      description: 'Expert in MERN stack with 2+ years of experience building scalable applications'
    },
    {
      icon: Brain,
      title: 'AI/ML Integration',
      description: 'Specialized in integrating AI and machine learning solutions into web applications'
    },
    {
      icon: Users,
      title: 'Team Leadership',
      description: 'Experienced in leading development teams and mentoring junior developers'
    },
    {
      icon: Award,
      title: 'Proven Results',
      description: 'Finalist in major hackathons and delivered 20+ successful projects'
    }
  ];

  if (!generalInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Available for opportunities
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Hi, I'm{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  {generalInfo.name}
                </span>
              </h1>
              
              <h2 className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6">
                {generalInfo.title}
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {generalInfo.summary}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/projects"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors group"
                >
                  View My Work
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/resume"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-lg transition-colors"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Resume
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold">
                    SM
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {generalInfo.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {generalInfo.location}
                  </p>
                  <div className="flex justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{generalInfo.email}</span>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What I Bring to the Table
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Combining technical expertise with leadership skills to deliver exceptional results
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Work Together?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Let's discuss how I can help bring your next project to life
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Get In Touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <button
                onClick={() => setShowChatBot(true)}
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask AI Assistant
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ChatBot */}
      {showChatBot && (
        <ChatBot onClose={() => setShowChatBot(false)} />
      )}
    </div>
  );
};

export default Home;
