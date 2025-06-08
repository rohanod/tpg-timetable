import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { TimetableContainer } from './TimetableContainer';
import { Toolbar } from './Toolbar';
import { useGetProject, useGetTimetables } from '../services/projects';
import { AppProvider } from '../contexts/AppContext';
import { PrintArea } from './PrintArea';
import { toast } from 'react-hot-toast';
import { ErrorBoundary } from './ErrorBoundary';
import { useStoreUserEffect } from '../services/auth';

export const ProjectEditor: React.FC = () => {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const { isLoading: authLoading, isAuthenticated } = useStoreUserEffect();
  
  const project = useGetProject(projectId);
  const timetables = useGetTimetables(projectId);
  
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    // Set up print listeners
    window.addEventListener('beforeprint', () => setIsPrinting(true));
    window.addEventListener('afterprint', () => setIsPrinting(false));
    
    return () => {
      window.removeEventListener('beforeprint', () => setIsPrinting(true));
      window.removeEventListener('afterprint', () => setIsPrinting(false));
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" role="status">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4" data-testid="project-loading"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Access Denied</h2>
          <p className="text-gray-700 mb-4">Please sign in to access this project.</p>
          <a
            href="/"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors inline-block"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  if (project === undefined || timetables === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" role="status">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Project Not Found</h2>
          <p className="text-gray-700 mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
          <a
            href="/"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors inline-block"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-700 mb-4">An error occurred while loading the project editor</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    }>
      <AppProvider>
        <div className={`min-h-screen bg-slate-50 flex flex-col ${isPrinting ? 'printing-active' : ''}`}>
          <div className="bg-white shadow-sm print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-4">
                  <a
                    href="/"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Back to Dashboard"
                    aria-label="Back to Dashboard"
                  >
                    <ArrowLeft size={20} />
                  </a>
                  <h1 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                    {project.name}
                  </h1>
                </div>
                
                <div className="flex items-center gap-3">
                  <a
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Settings size={18} />
                    Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="app-container w-full flex flex-col flex-1 min-h-0">
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
    </ErrorBoundary>
  );
};