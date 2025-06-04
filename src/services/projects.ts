import { supabase } from './auth';
import { Project, Timetable, TimetablePageData, UserProfile } from '../types';
import { toast } from 'react-hot-toast';

export const ProjectService = {
  async getProjects(): Promise<Project[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        timetables (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading projects:', error);
      throw error;
    }

    return projects || [];
  },

  async getProject(projectId: string): Promise<Project> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        timetables (*)
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error loading project:', error);
      throw error;
    }

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  },

  async getUserPermissions(): Promise<{ data: UserProfile }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user permissions:', error);
      return { data: { 
        id: user.id, 
        is_premium: false, 
        created_at: new Date().toISOString() 
      }};
    }

    return { data };
  },

  async createProject(name: string): Promise<Project> {
    if (!name.trim()) {
      throw new Error('Project name is required');
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id);

    if (existingProjects && existingProjects.length >= 1) {
      throw new Error('Free accounts can only create one project. Please delete an existing project first.');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        { name, user_id: user.id }
      ])
      .select(`
        *,
        timetables (*)
      `)
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create project - no data returned');
    }

    return data;
  },

  async getTimetables(projectId: string): Promise<Timetable[]> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    const { data: timetables, error } = await supabase
      .from('timetables')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading timetables:', error);
      throw error;
    }

    return timetables || [];
  },

  async addTimetable(projectId: string, timetable: Omit<TimetablePageData, 'id'>): Promise<Timetable> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    // Check timetable limit
    const { data: existingTimetables } = await supabase
      .from('timetables')
      .select('id')
      .eq('project_id', projectId);

    if (existingTimetables && existingTimetables.length >= 3) {
      throw new Error('You can only create three timetables per project');
    }

    // Create a new timetable
    const newTimetable = {
      project_id: projectId,
      stopName: timetable.stopName || 'New Timetable',
      stopId: timetable.stopId || '',
      theme: timetable.theme || 'color',
      data: timetable.data || []
    };

    const { data, error } = await supabase
      .from('timetables')
      .insert([newTimetable])
      .select()
      .single();

    if (error) {
      console.error('Error adding timetable:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create timetable');
    }

    return data;
  },

  async updateTimetable(timetableId: string, updates: Partial<TimetablePageData>): Promise<void> {
    if (!timetableId) {
      throw new Error('Timetable ID is required');
    }
    
    // Skip temporary IDs
    if (timetableId.startsWith('temp-')) {
      return;
    }

    // Remove id from updates if present
    const { id, ...updatesWithoutId } = updates as any;

    const { error } = await supabase
      .from('timetables')
      .update(updatesWithoutId)
      .eq('id', timetableId);

    if (error) {
      console.error('Error updating timetable:', error);
      throw error;
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    // Delete all timetables first
    const { error: timetablesError } = await supabase
      .from('timetables')
      .delete()
      .eq('project_id', projectId);

    if (timetablesError) {
      console.error('Error deleting project timetables:', timetablesError);
      throw timetablesError;
    }

    // Then delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  async deleteTimetable(timetableId: string): Promise<void> {
    if (!timetableId) {
      throw new Error('Timetable ID is required');
    }
    
    // Skip temporary IDs
    if (timetableId.startsWith('temp-')) {
      return;
    }

    const { error } = await supabase
      .from('timetables')
      .delete()
      .eq('id', timetableId);

    if (error) {
      console.error('Error deleting timetable:', error);
      throw error;
    }
  }
}