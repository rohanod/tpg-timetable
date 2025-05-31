import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/auth';

export const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback component mounted");
        
        // Get auth data from the session (tokens already extracted from URL by Supabase)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
          setError(error.message);
          return;
        }
        
        // Important: Clear the URL of sensitive tokens before proceeding
        // This helps prevent the security error
        if (window.location.hash) {
          // Use the clean navigate approach instead of directly manipulating history
          navigate('/auth/callback', { replace: true });
        }
        
        setTimeout(() => {
          if (data?.session) {
            console.log("Auth successful, redirecting to dashboard");
            navigate('/dashboard', { replace: true });
          } else {
            console.log("No session found, redirecting to home");
            navigate('/', { replace: true });
          }
        }, 100); // Small timeout to ensure URL is cleaned before redirect
      } catch (err) {
        console.error('Error processing auth callback:', err);
        setError('Failed to complete authentication. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-red-600">Authentication Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
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