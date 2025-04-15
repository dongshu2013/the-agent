"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// 定义用户类型
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

// 定义AuthContext的类型
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 模拟身份验证状态变化
  useEffect(() => {
    // 模拟身份验证加载
    const timer = setTimeout(() => {
      setUser(null);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 模拟使用Google登录
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // 在这里，我们只是模拟登录
      console.log("模拟Google登录");
      // 模拟成功登录
      setUser({
        uid: "mock-user-id",
        email: "user@example.com",
        displayName: "Test User",
        photoURL: "https://via.placeholder.com/150",
      });
    } catch (error) {
      console.error("登录错误:", error);
    } finally {
      setLoading(false);
    }
  };

  // 模拟退出登录
  const signOut = async () => {
    try {
      setLoading(true);
      // 模拟退出登录
      console.log("模拟退出登录");
      setUser(null);
    } catch (error) {
      console.error("退出错误:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义钩子来使用AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth必须在AuthProvider内部使用");
  }
  return context;
}
