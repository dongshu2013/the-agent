'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
  signInWithCustomToken,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserInfo, postRotateApiKey, postToggleApiKey } from '@/lib/api_service';

interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  apiKey: string | null;
  apiKeyEnabled: boolean;
  credits: number;
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

  // Handle user data when Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser);
          const userData = await getUserInfo(idToken);
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            apiKey: userData.user.api_key,
            apiKeyEnabled: userData.user.api_key_enabled,
            credits: userData.user.balance,
            idToken,
          });
        } catch (error) {
          console.error('Error setting up user:', error);
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
          const idToken = await getIdToken(user);
          setUser({
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            apiKey: null,
            apiKeyEnabled: false,
            credits: 0,
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
      setUser((prev) => (prev ? { ...prev, idToken: newToken } : null));
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Configure auth provider with custom parameters to avoid COOP issues
      provider.setCustomParameters({
        prompt: 'select_account',
        // This helps with some cross-origin issues
        auth_type: 'rerequest',
      });

      const result = await signInWithPopup(auth, provider);
      const idToken = await getIdToken(result.user);

      // 调用后端获取自定义 JWT
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!resp.ok) throw new Error('Login failed');
      const { jwt } = await resp.json();
      // 用自定义 JWT 登录 Firebase
      const userCredential = await signInWithCustomToken(auth, jwt);
      const user = userCredential.user;

      // 更新用户状态
      setUser({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        apiKey: null,
        apiKeyEnabled: false,
        credits: 0,
        idToken: jwt,
      });
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const rotateApiKey = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const { newApiKey } = await postRotateApiKey(user.idToken);
      setUser((prev) => (prev ? { ...prev, apiKey: newApiKey } : null));
      return newApiKey;
    } catch (error) {
      console.error('Error rotating API key:', error);
      return null;
    }
  };

  const toggleApiKey = async (enabled: boolean): Promise<boolean> => {
    if (!user) return false;

    try {
      await postToggleApiKey(user.idToken, enabled);
      setUser((prev) => (prev ? { ...prev, apiKeyEnabled: enabled } : null));
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
      const userData = await getUserInfo(token);
      setUser({
        ...user,
        apiKey: userData.user.api_key,
        apiKeyEnabled: userData.user.api_key_enabled,
        credits: userData.user.balance,
        idToken: token,
      });
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
