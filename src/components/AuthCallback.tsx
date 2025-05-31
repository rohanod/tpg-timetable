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
        
        // First, clear URL hash to prevent security issues
        if (window.location.hash) {
          // Replace the current URL without the hash
          window.history.replaceState(null, '', window.location.pathname);
        }
        
        // Process the session after clearing hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
          setError(error.message);
          return;
        }
        
        // Short delay to ensure browser state is settled
        setTimeout(() => {
          if (data?.session) {
            console.log("Auth successful, redirecting to dashboard");
            // Use window.location for a full page navigation to avoid history issues
            window.location.href = '/dashboard';
          } else {
            console.log("No session found, redirecting to home");
            window.location.href = '/';
          }
        }, 200);
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