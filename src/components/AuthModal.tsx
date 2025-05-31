import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AuthService } from '../services/auth';
import { supabase } from '../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (authView === 'sign_in') {
        await AuthService.login(email, password);
      } else {
        await AuthService.register(email, password);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'An error occurred with Google sign in');
      setIsLoading(false);
    }
  };

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
            <div className="space-y-6">
              <button 
                className="gsi-material-button w-full orange-google-button"
                onClick={handleGoogleSignIn}
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style={{display: 'block'}}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">Sign in with Google</span>
                  <span style={{display: 'none'}}>Sign in with Google</span>
                </div>
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
              
              <form onSubmit={handleEmailPasswordAuth}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-300 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      {authView === 'sign_up' ? 'Create a password' : 'Password'}
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-300 focus:border-orange-500"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    {isLoading ? 
                      (authView === 'sign_in' ? 'Signing in...' : 'Signing up...') : 
                      (authView === 'sign_in' ? 'Sign in' : 'Sign up')
                    }
                  </button>
                </div>
              </form>
              
              <div className="text-center text-sm">
                {authView === 'sign_in' ? (
                  <>
                    <a href="#forgot" className="text-orange-600 hover:text-orange-700">
                      Forgot your password?
                    </a>
                    <div className="mt-2">
                      Don't have an account?{' '}
                      <button 
                        onClick={() => setAuthView('sign_up')}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        Sign up
                      </button>
                    </div>
                  </>
                ) : (
                  <div>
                    Already have an account?{' '}
                    <button 
                      onClick={() => setAuthView('sign_in')}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      Sign in
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};