"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  apiKey: string | null;
  apiKeyEnabled: boolean;
  credits: string;
  idToken: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  rotateApiKey: () => Promise<string | null>;
  toggleApiKey: (enabled: boolean) => Promise<boolean>;
  refreshToken: () => Promise<string | null>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the ID token for the current user
  const getToken = async (firebaseUser: FirebaseUser): Promise<string> => {
    return await getIdToken(firebaseUser, true); // Force refresh
  };

  // Handle user data when Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("firebaseUser🍷", firebaseUser);
      if (firebaseUser) {
        try {
          // Get the ID token
          const idToken = await getToken(firebaseUser);

          // First, check if the user exists in our database
          try {
            const response = await fetch(
              `/api/auth/user?userId=${firebaseUser.uid}`,
              {
                headers: {
                  Authorization: `Bearer ${idToken}`,
                },
              }
            );

            if (response.ok) {
              // User exists, get their data
              const userData = await response.json();
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                apiKey: userData.apiKey,
                apiKeyEnabled: userData.apiKeyEnabled,
                credits: userData.credits,
                idToken,
              });
            } else if (response.status === 404) {
              // User doesn't exist, create a new user - this is expected for first-time login
              console.log("New user detected, creating user record...");
              const username =
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                `user_${Math.random().toString(36).substring(2, 10)}`;

              const createResponse = await fetch("/api/auth/user", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                  id: firebaseUser.uid,
                  username,
                  email: firebaseUser.email,
                }),
              });

              if (createResponse.ok) {
                const newUserData = await createResponse.json();
                console.log("User created successfully");
                setUser({
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL,
                  apiKey: newUserData.apiKey,
                  apiKeyEnabled: newUserData.apiKeyEnabled,
                  credits: newUserData.credits,
                  idToken,
                });
              } else {
                console.error(
                  "Failed to create user:",
                  await createResponse.text()
                );
              }
            } else {
              console.error(
                "Error fetching user data:",
                response.status,
                await response.text()
              );
            }
          } catch (fetchError) {
            // Handle fetch errors separately to avoid crashing the auth flow
            console.error("Error during user data fetch:", fetchError);
          }
        } catch (error) {
          console.error("Error setting up user:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          const idToken = await getToken(user);
          setUser({
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            apiKey: null,
            apiKeyEnabled: false,
            credits: "0",
            idToken,
          });
        }
      } catch (error) {
        console.error("Error handling redirect:", error);
      }
    };
    handleRedirect();
  }, []);

  // Refresh the ID token
  const refreshToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;

    try {
      const newToken = await getToken(auth.currentUser);
      setUser((prev) => (prev ? { ...prev, idToken: newToken } : null));
      return newToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Configure auth provider with custom parameters to avoid COOP issues
      provider.setCustomParameters({
        prompt: "select_account",
        // This helps with some cross-origin issues
        auth_type: "rerequest",
      });

      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const rotateApiKey = async (): Promise<string | null> => {
    if (!user || !user.idToken) return null;

    try {
      // Refresh token before making the request
      const token = (await refreshToken()) || user.idToken;

      const response = await fetch("/api/auth/apikey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          operation: "rotate",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the user state with the new API key
        setUser((prev) => (prev ? { ...prev, apiKey: data.apiKey } : null));
        return data.apiKey;
      }

      return null;
    } catch (error) {
      console.error("Error rotating API key:", error);
      return null;
    }
  };

  const toggleApiKey = async (enabled: boolean): Promise<boolean> => {
    if (!user || !user.idToken) return false;

    try {
      // Refresh token before making the request
      const token = (await refreshToken()) || user.idToken;

      const response = await fetch("/api/auth/apikey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          operation: "toggle",
          enabled,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the user state with the new API key enabled status
        setUser((prev) =>
          prev ? { ...prev, apiKeyEnabled: data.apiKeyEnabled } : null
        );
        return data.apiKeyEnabled;
      }

      return false;
    } catch (error) {
      console.error("Error toggling API key:", error);
      return false;
    }
  };

  // Function to refresh user data including credits
  const refreshUserData = async (): Promise<void> => {
    if (!auth.currentUser || !user) return;

    try {
      // Get a fresh token
      const token = await getToken(auth.currentUser);
      
      // Fetch the latest user data
      const response = await fetch(`/api/auth/user?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Update the user state with the fresh data
        setUser({
          ...user,
          apiKey: userData.apiKey,
          apiKeyEnabled: userData.apiKeyEnabled,
          credits: userData.credits,
          idToken: token,
        });
      } else {
        console.error('Failed to refresh user data');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOut,
        rotateApiKey,
        toggleApiKey,
        refreshToken,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
