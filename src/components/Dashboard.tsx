import React, { useState, useEffect } from 'react';
import { Plus, Trash2, LogOut, Settings, Calendar, Users } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const canCreateProject = userProfile?.is_premium || projects.length === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Bus Timetable Generator</h1>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">
                {userProfile?.is_premium ? 'Premium Account' : 'Free Account'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <p className="text-gray-600 mt-1">
              {userProfile?.is_premium 
                ? 'Premium account: Unlimited projects and timetables' 
                : 'Free account: 1 project with up to 3 timetables'}
            </p>
          </div>
          
          {!canCreateProject ? (
            <div className="flex flex-col gap-2 items-end">
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
                className="text-sm text-orange-600 hover:text-orange-700"
              >
                Upgrade to Premium
              </a>
            </div>
          ) : (
            <button
              onClick={() => setShowNewProjectDialog(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-md flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <Plus size={20} />
              New Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-orange-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Create your first project to get started generating bus timetables</p>
            <button
              onClick={() => setShowNewProjectDialog(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-md inline-flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <Plus size={20} />
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Created on {new Date(project.created_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="w-full px-4 py-2.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings size={18} />
                    Open Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!userProfile?.is_premium && (
          <div id="upgrade" className="mt-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Users size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Upgrade to Premium</h3>
                <p className="mb-4 text-white text-opacity-90">
                  Get unlimited projects and timetables, plus priority support and advanced features.
                </p>
                <button className="px-5 py-2.5 bg-white text-orange-600 font-medium rounded-md hover:bg-gray-100 transition-colors">
                  Upgrade Now
                </button>
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
      
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Bus Timetable Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};