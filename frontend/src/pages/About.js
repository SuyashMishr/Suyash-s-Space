import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, MapPin, Calendar, Heart, Target, Lightbulb } from 'lucide-react';

const About = () => {
  const [generalInfo, setGeneralInfo] = useState(null);
  const [skills, setSkills] = useState(null);

  useEffect(() => {
    // Load data
    Promise.all([
      fetch('/data/general_info.json').then(res => res.json()),
      fetch('/data/skills.json').then(res => res.json())
    ])
    .then(([generalData, skillsData]) => {
      setGeneralInfo(generalData);
      setSkills(skillsData);
    })
    .catch(error => console.error('Error loading data:', error));
  }, []);

  if (!generalInfo || !skills) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getSkillColor = (level) => {
    switch (level) {
      case 'expert': return 'bg-green-500';
      case 'advanced': return 'bg-blue-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'beginner': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSkillWidth = (level) => {
    switch (level) {
      case 'expert': return 'w-full';
      case 'advanced': return 'w-4/5';
      case 'intermediate': return 'w-3/5';
      case 'beginner': return 'w-2/5';
      default: return 'w-2/5';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            About Me
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get to know more about my journey, skills, and what drives me as a developer
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 sticky top-8">
              <div className="text-center mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold">
                  SM
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {generalInfo.name}
                </h2>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">
                  {generalInfo.title}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>{generalInfo.location}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-5 h-5" />
                  <span>Graduating {generalInfo.education.graduation_year}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Award className="w-5 h-5" />
                  <span>GPA: {generalInfo.education.gpa}</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Languages</h3>
                <div className="space-y-2">
                  {skills.languages.map((lang, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{lang.language}</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400 capitalize">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2 space-y-12"
          >
            {/* About Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Heart className="w-6 h-6 text-red-500 mr-3" />
                My Story
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {generalInfo.summary}
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {generalInfo.philosophy}
                </p>
              </div>
            </section>

            {/* Specializations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Target className="w-6 h-6 text-blue-500 mr-3" />
                Specializations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalInfo.specializations.map((spec, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{spec}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Award className="w-6 h-6 text-yellow-500 mr-3" />
                Key Achievements
              </h2>
              <div className="space-y-4">
                {generalInfo.achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-400">{achievement}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Fun Facts */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Lightbulb className="w-6 h-6 text-yellow-500 mr-3" />
                Fun Facts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalInfo.fun_facts.map((fact, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
                  >
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{fact}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Technical Skills */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Technical Skills
              </h2>
              
              {Object.entries(skills.technical).map(([category, skillList]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                    {category.replace('_', ' & ')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skillList.map((skill, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {skill.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {skill.level}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getSkillColor(skill.level)} ${getSkillWidth(skill.level)}`}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''} experience
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Soft Skills */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Soft Skills
              </h2>
              <div className="flex flex-wrap gap-3">
                {skills.soft.map((skill, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-2 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
