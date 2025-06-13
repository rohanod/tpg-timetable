import { useAuth0 } from '@auth0/auth0-react';
import { UserCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const AuthModal: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, user, logout } = useAuth0();
  const location = useLocation();

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center">
        {user.picture ? (
          <img 
            src={user.picture} 
            alt={user.name || "User"} 
            className="w-8 h-8 rounded-full mr-2" 
          />
        ) : (
          <UserCircle className="w-8 h-8 text-gray-400 mr-2" />
        )}
        <span className="mr-4 text-sm font-medium text-gray-700">{user.name}</span>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Sign Out"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      aria-label="Sign In"
    >
      <UserCircle size={20} />
      Sign In
    </button>
  );
};