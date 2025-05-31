import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { TimetableContainer } from './TimetableContainer';
import { Toolbar } from './Toolbar';
import { ProjectService } from '../services/projects';
import { Project, UserProfile } from '../types';
import { AuthService } from '../services/auth';
import { AppProvider } from '../contexts/AppContext';
import { PrintArea } from './PrintArea';
import { toast } from 'react-hot-toast';

export const ProjectEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    loadData();
    
    window.addEventListener('afterprint', () => {
      setIsPrinting(false);
    });
    return () => {
      window.removeEventListener('afterprint', () => {
        setIsPrinting(false);
      });
    };
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) {
      navigate('/dashboard');
      return;
    }

    try {
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        navigate('/');
        return;
      }

      const [projectData, profile] = await Promise.all([
        ProjectService.getProject(projectId),
        AuthService.getUserProfile()
      ]);
      
      setProject(projectData);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <AppProvider>
      <div className={`min-h-screen bg-slate-50 flex flex-col ${isPrinting ? 'printing-active' : ''}`}>
        <div className="bg-white shadow-sm print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Back to Dashboard"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                  {project.name}
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                {userProfile?.is_premium ? (
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs px-2.5 py-1 rounded-full">
                    Premium
                  </span>
                ) : (
                  <span className="bg-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-full">
                    Free
                  </span>
                )}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Settings size={18} />
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="app-container w-full flex flex-col flex-1 min-h-0">
          <Toolbar projectId={projectId} />
          <TimetableContainer setIsPrinting={setIsPrinting} projectId={projectId} />
        </div>
        
        <PrintArea />
      </div>
    </AppProvider>
  );
};