import { useEffect, useState } from 'react';
import { supabase } from '../services/auth';

export const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Processing authentication...");
        
        // Get the session (this will automatically process the URL)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          setError(error.message);
          return;
        }
        
        if (data?.session) {
          console.log("Auth successful, redirecting");
          // Use direct navigation instead of React Router to avoid state issues
          window.location.href = '/dashboard';
        } else {
          console.log("No session found");
          window.location.href = '/';
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Authentication failed. Please try again.');
      }
    };

    handleAuthCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-red-600">Authentication Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};