import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import { UserProfile } from '../types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Using fallback values for development.');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseKey || 'your-anon-key'
);

export const AuthService = {
  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  },

  // Get the current user's profile
  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      // Check if the profile exists
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
  
  // Email/Password login
  login: async (email: string, password: string): Promise<void> => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      // Verify session was created successfully
      if (!data.session) {
        throw new Error('Authentication failed - no session created');
      }
      
      toast.success('Logged in successfully!');
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  },
  
  // Email/Password registration
  register: async (email: string, password: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Check your email to confirm your account!');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  },
  
  // Sign out
  logout: async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
      throw error;
    }
  },
  
  // Refresh the session if needed
  refreshSession: async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        console.error('Session refresh failed:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }
};