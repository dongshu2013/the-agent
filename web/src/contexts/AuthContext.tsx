"use client";

import React, {
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
  signInWithCustomToken,
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
  signInWithCustomTokenFromBackend: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await getIdToken(firebaseUser, true);
        const response = await fetch(
          `/api/auth/user?userId=${firebaseUser.uid}`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        if (response.ok) {
          const userData = await response.json();
          setUser({ ...userData, idToken });
        } else {
          setUser(null);
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

  const refreshToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;

    try {
      const newToken = await getIdToken(auth.currentUser);
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
      provider.setCustomParameters({
        prompt: "select_account",
        auth_type: "rerequest",
      });

      const result = await signInWithPopup(auth, provider);
      const idToken = await getIdToken(result.user);

      // 调用后端获取自定义 JWT
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!resp.ok) throw new Error("Login failed");
      const { jwt } = await resp.json();

      console.log("..signInWithGoogle..", jwt);

      // 用自定义 JWT 登录 Firebase
      const userCredential = await signInWithCustomToken(auth, jwt);
      const user = userCredential.user;

      console.log(",.,.,.,.,.", jwt);

      // 更新用户状态
      setUser({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        apiKey: null,
        apiKeyEnabled: false,
        credits: "0",
        idToken: jwt,
      });
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

  const refreshUserData = async (): Promise<void> => {
    if (!auth.currentUser || !user) return;

    try {
      const token = await getIdToken(auth.currentUser);

      const response = await fetch(`/api/auth/user?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();

        setUser({
          ...user,
          apiKey: userData.apiKey,
          apiKeyEnabled: userData.apiKeyEnabled,
          credits: userData.credits,
          idToken: token,
        });
      } else {
        console.error("Failed to refresh user data");
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const signInWithCustomTokenFromBackend = async () => {
    console.log(".,.,.,.,.,", user);
    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: user?.idToken }),
    });
    if (!resp.ok) throw new Error("Login failed");
    const { jwt } = await resp.json();

    console.log("jwt🍷�� ", jwt);
    await signInWithCustomToken(auth, jwt);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithCustomTokenFromBackend,
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
