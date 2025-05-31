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

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id);

    if (!userProfile.is_premium && existingProjects && existingProjects.length >= 1) {
      throw new Error('Free users can only create one project. Upgrade to premium for unlimited projects.');
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
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', project.user_id)
      .single();

    const { data: existingTimetables } = await supabase
      .from('timetables')
      .select('id')
      .eq('project_id', projectId);

    if (!userProfile.is_premium && existingTimetables && existingTimetables.length >= 3) {
      throw new Error('Free users can only create three timetables per project. Upgrade to premium for unlimited timetables.');
    }

    const { data, error } = await supabase
      .from('timetables')
      .insert([
        { ...timetable, project_id: projectId }
      ])
      .select()
      .single();

    if (error) {
      toast.error('Failed to create timetable');
      throw error;
    }

    return data;
  },

  async updateTimetable(timetableId: string, updates: Partial<TimetablePageData>): Promise<void> {
    const { error } = await supabase
      .from('timetables')
      .update(updates)
      .eq('id', timetableId);

    if (error) {
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
    const { error } = await supabase
      .from('timetables')
      .delete()
      .eq('id', timetableId);

    if (error) {
      toast.error('Failed to delete timetable');
      throw error;
    }
  }
};