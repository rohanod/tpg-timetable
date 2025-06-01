import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Calendar, UserCircle } from 'lucide-react';

// Components
import { Dashboard } from './components/Dashboard';
import { ProjectEditor } from './components/ProjectEditor';
import { AuthModal } from './components/AuthModal';
import { AuthCallback } from './components/AuthCallback';

// Services
import { AuthService } from './services/auth';

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authStatus = await AuthService.isAuthenticated();
        setIsAuthenticated(authStatus);
        
        if (!authStatus) {
          setAuthModalOpen(true);
        }
      } catch (error) {
        console.error('Authentication verification failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      // Redirect handled in the service
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" role="status">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" data-testid="loading-spinner"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white flex flex-col">
        {!isAuthenticated && (
          <header className="bg-white shadow-sm print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-500 mr-2" />
                  <h1 className="text-xl font-semibold text-gray-900">Bus Timetable Generator</h1>
                </div>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Sign In"
                >
                  <UserCircle size={20} />
                  Sign In
                </button>
              </div>
            </div>
          </header>
        )}

        <Routes>
          {/* Public route - Auth callback */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected routes */}
          {isAuthenticated ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/project/:projectId" element={<ProjectEditor />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={
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
                        onClick={() => setAuthModalOpen(true)}
                        className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors w-full"
                      >
                        Sign In to Continue
                      </button>
                      <div className="text-sm text-gray-500">
                        Create up to 1 project with up to 3 timetables.
                      </div>
                    </div>
                  </div>
                </div>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
        
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => {
            setAuthModalOpen(false);
            AuthService.isAuthenticated().then(authenticated => {
              setIsAuthenticated(authenticated);
              if (authenticated) {
                window.location.href = '/dashboard';
              }
            });
          }} 
        />

        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;