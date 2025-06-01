import { supabase } from './auth';
import { Project, Timetable, TimetablePageData, UserProfile } from '../types';
import { toast } from 'react-hot-toast';

export const ProjectService = {
  async getProjects(): Promise<Project[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated in getProjects');
      throw new Error('Not authenticated');
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
      throw error;
    }

    return projects || [];
  },

  async getProject(projectId: string): Promise<Project> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Error loading project:', error);
        toast.error('Failed to load project');
        throw error;
      }

      if (!project) {
        throw new Error('Project not found');
      }

      return project;
    } catch (error: any) {
      console.error('Error in getProject:', error);
      toast.error(error.message || 'Failed to load project');
      throw error;
    }
  },

  async getUserPermissions(): Promise<{ data: UserProfile }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated in getUserPermissions');
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user permissions:', error);
      return { data: { id: user.id, is_premium: false, created_at: new Date().toISOString() } };
    }

    return { data };
  },

  async createProject(name: string): Promise<Project> {
    if (!name.trim()) {
      throw new Error('Project name is required');
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated in createProject');
      throw new Error('Not authenticated');
    }

    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id);

    if (existingProjects && existingProjects.length >= 1) {
      throw new Error('You can only create one project. Please delete an existing project first.');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        { name, user_id: user.id }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
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
    
    try {
      const { data: timetables, error } = await supabase
        .from('timetables')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading timetables:', error);
        toast.error('Failed to load timetables');
        throw error;
      }

      return timetables || [];
    } catch (error: any) {
      console.error('Error in getTimetables:', error);
      toast.error(error.message || 'Failed to load timetables');
      throw error;
    }
  },

  async addTimetable(projectId: string, timetable: Omit<TimetablePageData, 'id'>): Promise<Timetable> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    try {
      const { data: existingTimetables } = await supabase
        .from('timetables')
        .select('id')
        .eq('project_id', projectId);

      if (existingTimetables && existingTimetables.length >= 3) {
        throw new Error('You can only create three timetables per project. Please delete an existing timetable first.');
      }

      // Create a new timetable object without any id property
      const newTimetable = {
        project_id: projectId,
        stopName: timetable.stopName,
        stopId: timetable.stopId,
        theme: timetable.theme,
        data: timetable.data || []
      };

      const { data, error } = await supabase
        .from('timetables')
        .insert([newTimetable])
        .select()
        .single();

      if (error) {
        console.error('Error adding timetable:', error);
        toast.error('Failed to create timetable');
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create timetable - no data returned');
      }

      return data;
    } catch (error: any) {
      console.error('Error in addTimetable:', error);
      toast.error(error.message || 'Failed to create timetable');
      throw error;
    }
  },

  async updateTimetable(timetableId: string, updates: Partial<TimetablePageData>): Promise<void> {
    if (!timetableId) {
      throw new Error('Timetable ID is required');
    }
    
    // Make sure we don't try to update the id field or include temporary IDs
    if (timetableId.startsWith('temp-')) {
      console.warn('Attempted to update a timetable with a temporary ID:', timetableId);
      return;
    }

    // Create a new updates object without the id property
    const { id, ...updatesWithoutId } = updates as any;

    try {
      const { error } = await supabase
        .from('timetables')
        .update(updatesWithoutId)
        .eq('id', timetableId);

      if (error) {
        console.error('Error updating timetable:', error);
        toast.error('Failed to update timetable');
        throw error;
      }
    } catch (error: any) {
      console.error('Error in updateTimetable:', error);
      toast.error(error.message || 'Failed to update timetable');
      throw error;
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
        throw error;
      }
    } catch (error: any) {
      console.error('Error in deleteProject:', error);
      toast.error(error.message || 'Failed to delete project');
      throw error;
    }
  },

  async deleteTimetable(timetableId: string): Promise<void> {
    if (!timetableId) {
      throw new Error('Timetable ID is required');
    }
    
    // Skip deletion for temporary IDs
    if (timetableId.startsWith('temp-')) {
      console.warn('Attempted to delete a timetable with a temporary ID:', timetableId);
      return;
    }

    try {
      const { error } = await supabase
        .from('timetables')
        .delete()
        .eq('id', timetableId);

      if (error) {
        console.error('Error deleting timetable:', error);
        toast.error('Failed to delete timetable');
        throw error;
      }
    } catch (error: any) {
      console.error('Error in deleteTimetable:', error);
      toast.error(error.message || 'Failed to delete timetable');
      throw error;
    }
  }
};