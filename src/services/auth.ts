import { useAuth0 } from "@auth0/auth0-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

// Replacement for AuthService
export const AuthService = {
  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const { isAuthenticated } = useAuth0();
    return isAuthenticated;
  },

  // Get the current user's profile
  getUserProfile: async () => {
    const user = useQuery(api.auth.getCurrentUser);
    return user;
  },
  
  // Login with email/password
  login: async (email: string, password: string): Promise<void> => {
    // For Auth0, we'll use redirectToLogin which will open Auth0's login page
    const { loginWithRedirect } = useAuth0();
    await loginWithRedirect({
      authorizationParams: {
        login_hint: email
      }
    });
  },
  
  // Register with email/password
  register: async (email: string, password: string): Promise<void> => {
    // For Auth0, we'll use redirectToLogin with signup parameter
    const { loginWithRedirect } = useAuth0();
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        login_hint: email
      }
    });
  },
  
  // Sign out
  logout: async (): Promise<void> => {
    const { logout } = useAuth0();
    logout({ 
      logoutParams: {
        returnTo: window.location.origin 
      }
    });
  }
};

// Custom hook to store user in Convex after authentication
export function useStoreUserEffect() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.auth.storeUser);
  const [userStored, setUserStored] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Call the mutation to store the user
      storeUser()
        .then(() => setUserStored(true))
        .catch((error) => {
          console.error("Failed to store user:", error);
        });
    } else {
      setUserStored(false);
    }
  }, [isAuthenticated, storeUser]);

  return {
    isLoading: isLoading || (isAuthenticated && !userStored),
    isAuthenticated: isAuthenticated && userStored
  };
}