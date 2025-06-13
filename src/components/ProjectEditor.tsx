import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Toolbar } from './Toolbar';
import { TimetableContainer } from './TimetableContainer';
import { PrintArea } from './PrintArea';
import { AppProvider } from '../contexts/AppContext';
import { useGetProject, useGetTimetables } from '../services/projects';
import { toast } from 'react-hot-toast';

export const ProjectEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const project = useGetProject(projectId);
  const timetables = useGetTimetables(projectId);
  
  useEffect(() => {
    if (project === undefined || timetables === undefined) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setError(null);
    }
  }, [project, timetables]);
  
  useEffect(() => {
    // Add/remove printing class on body when printing state changes
    if (isPrinting) {
      document.body.classList.add('printing-active');
    } else {
      document.body.classList.remove('printing-active');
    }
    
    // Listen for print events to reset state
    const handleAfterPrint = () => {
      setIsPrinting(false);
      document.body.classList.remove('printing-active');
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
    
    return () => {
      document.body.classList.remove('printing-active');
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [isPrinting]);
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    // The queries will automatically re-run
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }
  
  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Project</h2>
          <p className="text-gray-700 mb-6">{error?.message || 'Project not found'}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
            >
              Retry
            </button>
            <button
              onClick={handleBackToDashboard}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <AppProvider>
      <div className="app-container min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-sm print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={handleBackToDashboard}
                className="mr-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            </div>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col min-h-0">
          <Toolbar projectId={projectId} />
          <TimetableContainer 
            setIsPrinting={setIsPrinting} 
            projectId={projectId}
            initialTimetables={timetables || []}
          />
        </div>
        
        <PrintArea />
      </div>
    </AppProvider>
  );
};