import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github, Calendar, Tag, CheckCircle, Clock, AlertCircle, Star } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load projects and find the specific one
    fetch('/data/projects.json')
      .then(response => response.json())
      .then(data => {
        const projectSlug = id;
        const foundProject = data.find(p => 
          p.title.toLowerCase().replace(/\s+/g, '-') === projectSlug
        );
        setProject(foundProject);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading project:', error);
        setLoading(false);
      });
  }, [id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'in-progress':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Project Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            to="/projects"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </motion.div>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                {project.featured && (
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                )}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  <span className="ml-2 capitalize">{project.status.replace('-', ' ')}</span>
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {project.category}
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {project.title}
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                {project.description}
              </p>
            </div>
            
            <div className="mt-6 md:mt-0 md:ml-8 flex flex-col space-y-3">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                >
                  <Github className="w-4 h-4 mr-2" />
                  View Code
                </a>
              )}
              
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Project Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Project Overview
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {project.longDescription}
                </p>
              </div>
            </motion.section>

            {/* Challenges */}
            {project.challenges && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Challenges Faced
                </h2>
                <div className="space-y-4">
                  {project.challenges.map((challenge, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 bg-red-50 dark:bg-red-900/20 rounded-lg p-4"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-700 dark:text-gray-300">{challenge}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Solutions */}
            {project.solutions && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Solutions Implemented
                </h2>
                <div className="space-y-4">
                  {project.solutions.map((solution, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300">{solution}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Key Learnings */}
            {project.learnings && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Key Learnings
                </h2>
                <div className="space-y-4">
                  {project.learnings.map((learning, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-700 dark:text-gray-300">{learning}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sticky top-8"
            >
              {/* Technologies */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Project Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {project.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Featured:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {project.featured ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
