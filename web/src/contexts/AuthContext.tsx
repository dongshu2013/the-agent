'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createApiClient } from '@/lib/api_client';

interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  apiKey: string | null;
  apiKeyEnabled: boolean;
  balance: number;
  idToken: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  rotateApiKey: () => Promise<string | null>;
  toggleApiKey: (enabled: boolean) => Promise<boolean>;
  refreshToken: () => Promise<string | null>;
  refreshUserData: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle user data when Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const idToken = await getIdToken(firebaseUser);
        const userData = await createApiClient(idToken).getUser();
        setAuthToLocalAndPostMessage({
          apiKey: userData.api_key,
          apiKeyEnabled: userData.api_key_enabled,
        });
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          apiKey: userData.api_key,
          apiKeyEnabled: userData.api_key_enabled,
          balance: userData.balance,
          idToken,
        });
      } else {
        setUser(null);
        setAuthToLocalAndPostMessage({ apiKey: '', apiKeyEnabled: false });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          const idToken = await getIdToken(user);
          setUser({
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            apiKey: null,
            apiKeyEnabled: false,
            balance: 0,
            idToken,
          });
        }
      } catch (error) {
        console.error('Error handling redirect:', error);
      }
    };
    handleRedirect();
  }, []);

  // Refresh the ID token
  const refreshToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;

    try {
      const newToken = await getIdToken(auth.currentUser);
      setUser(prev => ({ ...prev, idToken: newToken }));
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      provider.setCustomParameters({
        prompt: 'select_account',
        auth_type: 'rerequest',
      });

      const result = await signInWithPopup(auth, provider);
      const idToken = await getIdToken(result.user);

      // Get user information
      const userData = await createApiClient(idToken).getUser();

      // Post message
      setAuthToLocalAndPostMessage({
        apiKey: userData.api_key,
        apiKeyEnabled: userData.api_key_enabled,
      });

      setUser({
        id: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        apiKey: userData.api_key,
        apiKeyEnabled: userData.api_key_enabled,
        balance: userData.balance,
        idToken,
      });
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setAuthToLocalAndPostMessage({ apiKey: '', apiKeyEnabled: false });
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const rotateApiKey = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const { newApiKey } = await createApiClient(user.idToken).rotateApiKey();
      setUser(prev => ({ ...prev, apiKey: newApiKey }));
      setAuthToLocalAndPostMessage({ apiKey: newApiKey, apiKeyEnabled: user.apiKeyEnabled });
      return newApiKey;
    } catch (error) {
      console.error('Error rotating API key:', error);
      return null;
    }
  };

  const toggleApiKey = async (enabled: boolean): Promise<boolean> => {
    if (!user) return false;

    try {
      await createApiClient(user.idToken).toggleApiKey({ enabled });
      setUser(prev => ({ ...prev, apiKeyEnabled: enabled }));
      setAuthToLocalAndPostMessage({ apiKey: user.apiKey, apiKeyEnabled: enabled });
      return enabled;
    } catch (error) {
      console.error('Error toggling API key:', error);
      return false;
    }
  };

  // Function to refresh user data including credits
  const refreshUserData = async (): Promise<void> => {
    if (!user) return;

    try {
      const token = await getIdToken(auth.currentUser);
      const userData = await createApiClient(token).getUser();
      setUser({
        ...user,
        apiKey: userData.api_key,
        apiKeyEnabled: userData.api_key_enabled,
        balance: userData.balance,
        idToken: token,
      });

      setAuthToLocalAndPostMessage({
        apiKey: userData.api_key,
        apiKeyEnabled: userData.api_key_enabled,
      });
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    if (user?.apiKey) {
      setAuthToLocalAndPostMessage({ apiKey: user.apiKey, apiKeyEnabled: user.apiKeyEnabled });
    }
  }, [user?.apiKey]);

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

// Hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Helper function to set API key in localStorage and post message
function setAuthToLocalAndPostMessage({
  apiKey,
  apiKeyEnabled,
}: {
  apiKey?: string;
  apiKeyEnabled?: boolean;
}) {
  if (apiKey) {
    localStorage.setItem('apiKey', JSON.stringify({ apiKey, apiKeyEnabled }));
    window.postMessage(
      {
        type: 'FROM_WEB_TO_EXTENSION',
        data: {
          host: window.location.hostname,
          apiKey,
          apiKeyEnabled,
        },
      },
      '*'
    );
  }
}
