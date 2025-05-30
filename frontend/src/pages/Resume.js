import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, MapPin, Award, GraduationCap, Briefcase, Star } from 'lucide-react';

const Resume = () => {
  const [generalInfo, setGeneralInfo] = useState(null);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState(null);

  useEffect(() => {
    // Load data
    Promise.all([
      fetch('/data/general_info.json').then(res => res.json()),
      fetch('/data/experience.json').then(res => res.json()),
      fetch('/data/skills.json').then(res => res.json())
    ])
    .then(([generalData, experienceData, skillsData]) => {
      setGeneralInfo(generalData);
      setExperience(experienceData);
      setSkills(skillsData);
    })
    .catch(error => console.error('Error loading data:', error));
  }, []);

  const handleDownload = () => {
    // Create a simple PDF download or link to resume file
    const link = document.createElement('a');
    link.href = '/resume.pdf'; // You would need to add this file to public folder
    link.download = 'Suyash_Mishra_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!generalInfo || !skills) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Resume
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            A comprehensive overview of my professional journey and skills
          </p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF
          </button>
        </motion.div>

        {/* Resume Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden"
        >
          {/* Personal Info Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                SM
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold mb-2">{generalInfo.name}</h2>
                <p className="text-xl text-blue-100 mb-4">{generalInfo.title}</p>
                <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 text-blue-100">
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{generalInfo.location}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <span>{generalInfo.email}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <span>{generalInfo.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-12">
            {/* Professional Summary */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Star className="w-6 h-6 text-blue-600 mr-3" />
                Professional Summary
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {generalInfo.summary}
              </p>
            </section>

            {/* Education */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <GraduationCap className="w-6 h-6 text-blue-600 mr-3" />
                Education
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {generalInfo.education.degree}
                  </h4>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    GPA: {generalInfo.education.gpa}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {generalInfo.education.university}
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
                  Expected Graduation: {generalInfo.education.graduation_year}
                </p>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Relevant Coursework:</h5>
                  <div className="flex flex-wrap gap-2">
                    {generalInfo.education.relevant_courses.map((course, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Experience */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Briefcase className="w-6 h-6 text-blue-600 mr-3" />
                Professional Experience
              </h3>
              <div className="space-y-6">
                {experience.map((job, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="border-l-4 border-blue-500 pl-6 pb-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {job.position}
                      </h4>
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {formatDate(job.startDate)} - {formatDate(job.endDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {job.company}
                      </p>
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{job.location}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {job.description}
                    </p>
                    
                    {/* Achievements */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Key Achievements:</h5>
                      <ul className="space-y-1">
                        {job.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-start space-x-2 text-gray-600 dark:text-gray-400">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Technologies */}
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Technologies Used:</h5>
                      <div className="flex flex-wrap gap-2">
                        {job.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Key Skills */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Core Competencies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(skills.technical).map(([category, skillList]) => (
                  <div key={category} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                      {category.replace('_', ' & ')}
                    </h4>
                    <div className="space-y-3">
                      {skillList.slice(0, 5).map((skill, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                          <span className="text-sm text-blue-600 dark:text-blue-400 capitalize">
                            {skill.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Award className="w-6 h-6 text-blue-600 mr-3" />
                Certifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalInfo.certifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-yellow-500"
                  >
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{cert}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Achievements */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Notable Achievements
              </h3>
              <div className="space-y-3">
                {generalInfo.achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <Award className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">{achievement}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Resume;
