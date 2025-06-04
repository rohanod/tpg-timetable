import { useState, useEffect } from 'react';
import { Plus, Trash2, LogOut, Calendar } from 'lucide-react';
import { useGetProjects, useCreateProject, useDeleteProject } from '../services/projects';
import { Project } from '../types';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-hot-toast';
import { ErrorBoundary } from './ErrorBoundary';
import { useStoreUserEffect } from '../services/auth';
import { useConvexAuth } from 'convex/react';

export const Dashboard: React.FC = () => {
  const { logout } = useAuth0();
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const userStatus = useStoreUserEffect();
  
  const projects = useGetProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);

  useEffect(() => {
    // Update loading state based on both auth and projects data
    setIsLoading(authLoading || userStatus.isLoading || projects === undefined);
    
    if (!authLoading && !userStatus.isLoading && !userStatus.isAuthenticated) {
      window.location.href = '/';
    }
  }, [authLoading, userStatus, projects]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      await createProject({ name: newProjectName });
      setNewProjectName('');
      setShowNewProjectDialog(false);
      toast.success('Project created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      await deleteProject({ projectId });
      toast.success('Project deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const handleLogout = async () => {
    try {
      logout({ 
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" role="status">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" data-testid="dashboard-loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center" role="alert">
          <h2 className="text-xl font-bold mb-4 text-red-600">Error Loading Dashboard</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => {
              setIsLoading(true);
              setError(null);
              // Reload page as simplest way to retry
              window.location.reload();
            }}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const canCreateProject = Array.isArray(projects) && projects.length === 0;

  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Something went wrong</h2>
          <p className="text-gray-700 mb-4">An unexpected error occurred while displaying the dashboard.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-500 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">Bus Timetable Generator</h1>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Sign Out"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Create and manage your bus timetable projects
                </p>
              </div>
              
              {!canCreateProject ? (
                <div className="mt-4 sm:mt-0 flex">
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md flex items-center gap-2 cursor-not-allowed"
                    disabled
                    title="You can only create one project"
                    aria-disabled="true"
                  >
                    <Plus size={20} />
                    New Project
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewProjectDialog(true)}
                  className="mt-4 sm:mt-0 px-4 py-2 bg-orange-500 text-white rounded-md flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-sm"
                  data-testid="new-project-button"
                >
                  <Plus size={20} />
                  New Project
                </button>
              )}
            </div>
          </div>

          {Array.isArray(projects) && projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">No projects yet</h3>
              <p className="mt-2 text-gray-500">
                Create your first project to get started generating bus timetables
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowNewProjectDialog(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  data-testid="create-first-project-button"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Create First Project
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(projects) && projects.map(project => (
                <div 
                  key={project._id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                  data-testid={`project-card-${project._id}`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete project"
                        aria-label={`Delete project ${project.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Created on {new Date(project.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-5">
                      <a
                        href={`/project/${project._id}`}
                        className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        Open Project
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showNewProjectDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full p-2.5 border rounded-md mb-4 focus:ring-2 focus:ring-orange-300 focus:border-orange-500"
                  autoFocus
                  data-testid="new-project-name-input"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowNewProjectDialog(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProject}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                    data-testid="create-project-submit"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
        
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Bus Timetable Generator. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};