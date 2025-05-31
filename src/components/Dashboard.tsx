import React, { useState, useEffect } from 'react';
import { Plus, Trash2, LogOut, Settings, Calendar, Users, Bell } from 'lucide-react';
import { ProjectService } from '../services/projects';
import { Project, UserProfile } from '../types';
import { AuthService } from '../services/auth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        navigate('/');
        return;
      }

      const [projectsData, profile] = await Promise.all([
        ProjectService.getProjects(),
        AuthService.getUserProfile()
      ]);
      
      setProjects(projectsData);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      const project = await ProjectService.createProject(newProjectName);
      setProjects(prev => [project, ...prev]);
      setNewProjectName('');
      setShowNewProjectDialog(false);
      toast.success('Project created successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      await ProjectService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const canCreateProject = userProfile?.is_premium || projects.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-500 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Bus Timetable Generator</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {userProfile?.is_premium && (
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                  Premium
                </span>
              )}
              
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full">
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                </button>
              </div>
              
              <div className="border-l border-gray-200 h-6 mx-2"></div>
              
              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="ml-2 flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
              <p className="mt-1 text-sm text-gray-500">
                {userProfile?.is_premium 
                  ? 'Premium account: Unlimited projects and timetables' 
                  : 'Free account: 1 project with up to 3 timetables'}
              </p>
            </div>
            
            {!canCreateProject ? (
              <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md flex items-center gap-2 cursor-not-allowed"
                  disabled
                  title="Free users can only create one project"
                >
                  <Plus size={20} />
                  New Project
                </button>
                <a 
                  href="#upgrade" 
                  className="mt-2 text-sm text-orange-600 hover:text-orange-700"
                >
                  Upgrade to Premium
                </a>
              </div>
            ) : (
              <button
                onClick={() => setShowNewProjectDialog(true)}
                className="mt-4 sm:mt-0 px-4 py-2 bg-orange-500 text-white rounded-md flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-sm"
              >
                <Plus size={20} />
                New Project
              </button>
            )}
          </div>
        </div>

        {projects.length === 0 ? (
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
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Create First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <div 
                key={project.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Created on {new Date(project.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-5">
                    <button
                      onClick={() => navigate(`/project/${project.id}`)}
                      className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <Settings className="-ml-1 mr-2 h-5 w-5" />
                      Open Project
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!userProfile?.is_premium && (
          <div id="upgrade" className="mt-12 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-8 bg-gradient-to-r from-orange-500 to-amber-500 sm:p-10 sm:pb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-white/20 rounded-full p-3">
                  <Users className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-semibold text-white">Upgrade to Premium</h3>
                  <p className="text-orange-50 mt-1">Get unlimited projects and timetables</p>
                </div>
              </div>
            </div>
            <div className="border-t border-orange-100 bg-orange-50 px-6 py-6 sm:px-10 sm:py-6">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-center">
                      <span className="h-5 w-5 text-orange-500 mr-2">✓</span>
                      <span className="text-gray-700">Unlimited projects</span>
                    </li>
                    <li className="flex items-center">
                      <span className="h-5 w-5 text-orange-500 mr-2">✓</span>
                      <span className="text-gray-700">Unlimited timetables per project</span>
                    </li>
                    <li className="flex items-center">
                      <span className="h-5 w-5 text-orange-500 mr-2">✓</span>
                      <span className="text-gray-700">Priority support</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 sm:mt-0 sm:ml-6">
                  <button className="w-full flex justify-center py-2.5 px-5 border border-transparent rounded-md shadow-sm text-sm font-medium text-orange-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showNewProjectDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full p-2.5 border rounded-md mb-4 focus:ring-2 focus:ring-orange-300 focus:border-orange-500"
                autoFocus
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
  );
};