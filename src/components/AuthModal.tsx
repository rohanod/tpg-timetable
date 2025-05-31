import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AuthService } from '../services/auth';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>('sign_in');

  useEffect(() => {
    const handleAuthStateChange = async (event: any) => {
      if (event === 'SIGNED_IN') {
        setIsLoading(true);
        try {
          await AuthService.getUserProfile();
          onClose();
          window.location.href = '/dashboard';
        } catch (error) {
          console.error('Error handling sign in:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Welcome to Bus Timetable Generator</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <Auth
              supabaseClient={supabase}
              view={authView}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#f97316',
                      brandAccent: '#ea580c',
                    },
                  },
                },
                className: {
                  container: 'w-full',
                  button: 'w-full px-4 py-2.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors',
                  input: 'w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-300 focus:border-orange-500',
                  label: 'block text-sm font-medium text-gray-700 mb-1',
                  anchor: 'text-orange-600 hover:text-orange-700',
                  divider: 'my-6',
                  message: 'text-center text-sm mb-4',
                  // Dark Google provider button
                  auth_button: 'w-full',
                  auth_button_provider_google: `
                    google-button
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    bg-black
                    text-white
                    border
                    border-black
                    rounded-md
                    transition-colors
                    font-medium
                    my-2
                    hover:bg-gray-900
                  `
                },
                style: {
                  button: {
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                  input: {
                    borderRadius: '6px',
                  }
                },
              }}
              theme="default"
              providers={['google']}
              redirectTo={`${window.location.origin}/auth/callback`}
              onViewChange={(newView) => setAuthView(newView as 'sign_in' | 'sign_up')}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email address',
                    password_label: 'Password',
                    button_label: 'Sign in',
                    loading_button_label: 'Signing in...',
                    social_provider_text: 'Sign in with {{provider}}',
                    link_text: "Don't have an account? Sign up"
                  },
                  sign_up: {
                    email_label: 'Email address',
                    password_label: 'Create a password',
                    button_label: 'Sign up',
                    loading_button_label: 'Signing up...',
                    social_provider_text: 'Sign up with {{provider}}',
                    link_text: 'Already have an account? Sign in'
                  }
                }
              }}
            />
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-600">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
};