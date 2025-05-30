import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ConfidentialWatermark = () => {
  const { isDark } = useTheme();

  return (
    <>
      {/* Top Banner */}
      <div className="bg-red-600 text-white text-center py-1 text-xs font-medium z-50 relative">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>CONFIDENTIAL - PRIVATE PORTFOLIO</span>
        </div>
      </div>

      {/* Floating Watermark */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 select-none">
        <div
          className={`text-6xl md:text-8xl font-bold opacity-5 ${
            isDark ? 'text-white' : 'text-gray-900'
          } transform rotate-45`}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        >
          CONFIDENTIAL
        </div>
      </div>

      {/* Corner Watermarks */}
      <div className="fixed top-4 right-4 pointer-events-none z-10 select-none">
        <div className={`text-xs font-medium px-2 py-1 rounded ${
          isDark 
            ? 'bg-red-900/20 text-red-400 border border-red-800/30' 
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          PRIVATE
        </div>
      </div>

      <div className="fixed bottom-4 left-4 pointer-events-none z-10 select-none">
        <div className={`text-xs font-medium px-2 py-1 rounded ${
          isDark 
            ? 'bg-red-900/20 text-red-400 border border-red-800/30' 
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          CONFIDENTIAL
        </div>
      </div>
    </>
  );
};

export default ConfidentialWatermark;
