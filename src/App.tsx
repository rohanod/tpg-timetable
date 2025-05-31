import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { ProjectEditor } from './components/ProjectEditor';
import { AuthModal } from './components/AuthModal';
import { AuthService } from './services/auth';
import { Toaster } from 'react-hot-toast';
import { UserCircle, Calendar } from 'lucide-react';
import { Terms } from './components/Terms';
import { Privacy } from './components/Privacy';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await AuthService.isAuthenticated();
        setIsAuthenticated(authenticated);
        if (!authenticated) {
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setIsAuthenticated(false);
      setShowAuthModal(true);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col">
        {!isAuthenticated && (
          <div className="bg-white shadow-sm print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-500 mr-2" />
                  <h1 className="text-xl font-semibold text-gray-900">Bus Timetable Generator</h1>
                </div>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <UserCircle size={20} />
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}

        {isAuthenticated ? (
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:projectId" element={<ProjectEditor />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/" element={<Navigate to="/dashboard\" replace />} />
            <Route path="*\" element={<Navigate to="/dashboard\" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to Bus Timetable Generator</h2>
                  <p className="text-gray-600 mb-6">
                    Create beautiful, printable timetables for bus and tram stops. Sign in to get started.
                  </p>
                  <div className="flex flex-col space-y-4">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors w-full"
                    >
                      Sign In to Continue
                    </button>
                    <div className="text-sm text-gray-500">
                      Free accounts can create 1 project with up to 3 timetables. 
                    </div>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        )}
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => {
            setShowAuthModal(false);
            // Check if the user is authenticated after the modal is closed
            AuthService.isAuthenticated().then(authenticated => {
              setIsAuthenticated(authenticated);
            });
          }} 
        />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;