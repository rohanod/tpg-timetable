import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import { UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseKey || 'your-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);

export interface User {
  id: string;
  email: string;
}

export const AuthService = {
  currentUser: null as User | null,
  
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  },

  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) return null;

      // First check if the profile exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        // Create a profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email,
          is_premium: false,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          return null;
        }

        return createdProfile;
      }

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },
  
  login: async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      toast.error(error.message);
      throw error;
    }
    
    toast.success('Welcome back!');
    window.location.href = '/dashboard';
  },
  
  register: async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      toast.error(error.message);
      throw error;
    }
    
    toast.success('Check your email to confirm your account!');
  },
  
  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(error.message);
      throw error;
    }
    
    toast.success('Logged out successfully');
    window.location.href = '/';
  }
};