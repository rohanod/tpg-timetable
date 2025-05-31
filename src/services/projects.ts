import { supabase } from './auth';
import { Project, Timetable, TimetablePageData, UserProfile } from '../types';
import { toast } from 'react-hot-toast';

export const ProjectService = {
  async getProjects(): Promise<Project[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load projects');
      throw error;
    }

    return projects || [];
  },

  async getProject(projectId: string): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      toast.error('Failed to load project');
      throw error;
    }

    return project;
  },

  async getUserPermissions(): Promise<{ data: UserProfile }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

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
      toast.error('Failed to create project');
      throw error;
    }

    return data;
  },

  async getTimetables(projectId: string): Promise<Timetable[]> {
    const { data: timetables, error } = await supabase
      .from('timetables')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Failed to load timetables');
      throw error;
    }

    return timetables || [];
  },

  async addTimetable(projectId: string, timetable: Omit<TimetablePageData, 'id'>): Promise<Timetable> {
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

    return data;
  },

  async updateTimetable(timetableId: string, updates: Partial<TimetablePageData>): Promise<void> {
    // Make sure we don't try to update the id field or include temporary IDs
    if (timetableId.startsWith('temp-')) {
      console.warn('Attempted to update a timetable with a temporary ID:', timetableId);
      return;
    }

    // Create a new updates object without the id property
    const { id, ...updatesWithoutId } = updates as any;

    const { error } = await supabase
      .from('timetables')
      .update(updatesWithoutId)
      .eq('id', timetableId);

    if (error) {
      console.error('Error updating timetable:', error);
      toast.error('Failed to update timetable');
      throw error;
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      toast.error('Failed to delete project');
      throw error;
    }
  },

  async deleteTimetable(timetableId: string): Promise<void> {
    // Skip deletion for temporary IDs
    if (timetableId.startsWith('temp-')) {
      console.warn('Attempted to delete a timetable with a temporary ID:', timetableId);
      return;
    }

    const { error } = await supabase
      .from('timetables')
      .delete()
      .eq('id', timetableId);

    if (error) {
      console.error('Error deleting timetable:', error);
      toast.error('Failed to delete timetable');
      throw error;
    }
  }
};