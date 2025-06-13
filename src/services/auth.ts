import { useAuth0 } from "@auth0/auth0-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { api } from "../../convex/_generated/api";

// Custom hook to handle user storage and authentication state
export function useStoreUserEffect() {
  const { isLoading: convexLoading, isAuthenticated: convexAuthenticated } = useConvexAuth();
  const { isAuthenticated: auth0Authenticated, user: auth0User } = useAuth0();
  const storeUser = useMutation(api.auth.storeUser);
  const currentUser = useQuery(api.auth.getCurrentUser);
  const currentUser = useQuery(api.auth.getCurrentUser);
  
  const [isStoringUser, setIsStoringUser] = useState(false);
  const [hasStoredUser, setHasStoredUser] = useState(false);

  useEffect(() => {
    const handleUserStorage = async () => {
      // Only proceed if Auth0 and Convex are both authenticated
      if (!auth0Authenticated || !convexAuthenticated || isStoringUser) {
        return;
      }

      // If we already have a user in the database, no need to store again
      if (currentUser) {
        setHasStoredUser(true);
        return;
      }

      try {
        setIsStoringUser(true);
        await storeUser();
        setHasStoredUser(true);
      } catch (error) {
        console.error("Failed to store user:", error);
        setHasStoredUser(false);
      } finally {
        setIsStoringUser(false);
      }
    };

    handleUserStorage();
  }, [auth0Authenticated, convexAuthenticated, storeUser, isStoringUser, hasStoredUser]);

  // Reset state when user logs out
  useEffect(() => {
    if (!auth0Authenticated) {
      setHasStoredUser(false);
      setIsStoringUser(false);
    }
  }, [auth0Authenticated]);

  const isLoading = convexLoading || isStoringUser;
  const isAuthenticated = convexAuthenticated && (hasStoredUser || !!currentUser);

  return {
    isLoading,
    isAuthenticated,
    user: currentUser
    user: currentUser
  };
}

// Get current user profile
export function useCurrentUser() {
  return useQuery(api.auth.getCurrentUser);
}

// Get user permissions
export function useUserPermissions() {
  return useQuery(api.auth.getUserPermissions);
}