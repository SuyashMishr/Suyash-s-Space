import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ConfidentialWatermark from './components/common/ConfidentialWatermark';
import ScrollToTop from './components/common/ScrollToTop';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Resume from './pages/Resume';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Context
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Styles
import './index.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add confidential meta tags
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow, noarchive, nosnippet';
    document.head.appendChild(metaRobots);

    const metaConfidential = document.createElement('meta');
    metaConfidential.name = 'confidential';
    metaConfidential.content = 'true';
    document.head.appendChild(metaConfidential);

    // Disable right-click context menu for additional security
    const handleContextMenu = (e) => {
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);

    // Simulate loading
    setTimeout(() => setLoading(false), 1000);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <div className="min-h-screen">
            <Helmet>
              <title>Suyash Mishra - Portfolio (Confidential)</title>
              <meta name="description" content="Confidential portfolio website showcasing professional work and experience." />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
              <meta name="confidential" content="true" />
              <meta property="og:title" content="Portfolio - Confidential" />
              <meta property="og:description" content="Confidential portfolio website" />
              <meta property="og:type" content="website" />
              <link rel="canonical" href={window.location.href} />
            </Helmet>

            <Router>
              <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                {/* Confidential Watermark */}
                <ConfidentialWatermark />

                {/* Navigation */}
                <Navbar />

                {/* Main Content */}
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/resume" element={<Resume />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin/*" element={<Admin />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>

                {/* Footer */}
                <Footer />

                {/* Scroll to Top Button */}
                <ScrollToTop />
              </div>
            </Router>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                  border: '1px solid var(--toast-border)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
