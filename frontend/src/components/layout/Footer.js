import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Shield, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/SuyashMishr',
      icon: Github,
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/suyash-mishra-b8667a253/',
      icon: Linkedin,
    },
    {
      name: 'Email',
      href: 'mailto:suyashmishraa983@gmail.com',
      icon: Mail,
    },
  ];

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Projects', href: '/projects' },
    { name: 'Resume', href: '/resume' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                Suyash Mishra
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              MERN Full-Stack Developer & AI Engineer passionate about building scalable 
              web applications and AI-powered solutions.
            </p>
            <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
              <Shield className="h-4 w-4" />
              <span className="font-medium">CONFIDENTIAL PORTFOLIO</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Connect
            </h3>
            <div className="space-y-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} Suyash Mishra. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <Shield className="h-4 w-4" />
                <span>Private & Confidential</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Built with MERN Stack
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
