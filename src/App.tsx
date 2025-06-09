import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Calendar } from 'lucide-react';

// Components
import { Dashboard } from './components/Dashboard';
import { ProjectEditor } from './components/ProjectEditor';
import { AuthModal } from './components/AuthModal';

// Auth
import { useConvexAuth } from 'convex/react';
import { useStoreUserEffect } from './services/auth';
import { Authenticated, Unauthenticated } from 'convex/react';

function App() {
  const { isLoading: convexLoading } = useConvexAuth();
  const { isLoading: userLoading, isAuthenticated } = useStoreUserEffect();

  // Show loading while authentication is being established
  if (convexLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" role="status">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4" data-testid="loading-spinner"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white flex flex-col">
        <Unauthenticated>
          <header className="bg-white shadow-sm print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-500 mr-2" />
                  <h1 className="text-xl font-semibold text-gray-900">Bus Timetable Generator</h1>
                </div>
                <AuthModal />
              </div>
            </div>
          </header>
          
          <Routes>
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
                  <div className="text-sm text-gray-500">
                    Create up to 1 project with up to 3 timetables.
                  </div>
                </div>
              </div>
            } />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Unauthenticated>

        <Authenticated>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:projectId" element={<ProjectEditor />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Authenticated>

        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;