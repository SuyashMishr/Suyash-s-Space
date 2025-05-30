import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('portfolio-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    // Update document class and CSS variables
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--toast-bg', '#1e293b');
      root.style.setProperty('--toast-color', '#f1f5f9');
      root.style.setProperty('--toast-border', '#334155');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--toast-bg', '#ffffff');
      root.style.setProperty('--toast-color', '#1e293b');
      root.style.setProperty('--toast-border', '#e2e8f0');
    }
    
    // Save theme preference
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
