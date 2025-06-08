import { useEffect, useState } from 'react';
import { supabase } from '../services/auth';

export const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the callback - this automatically handles the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Authentication callback error:', error);
          setError(error.message);
          return;
        }
        
        if (data?.session) {
          // Redirect to dashboard after successful authentication
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } else {
          // If no session was established, redirect back to home
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        }
      } catch (err) {
        console.error('Unexpected error during authentication:', err);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4" role="status"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};