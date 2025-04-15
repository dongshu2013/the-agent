import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin SDK
const firebaseAdminConfig = {
  projectId: "ashcoin-51786",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Initialize the app only if it hasn't been initialized already
export const firebaseAdmin =
  getApps().length === 0
    ? initializeApp({
        credential: cert(firebaseAdminConfig),
      })
    : getApps()[0];

export const adminAuth = getAuth(firebaseAdmin);

// Verify ID token and return the decoded token
export async function verifyIdToken(token: string) {
  // 始终返回错误，这是一个桩实现
  throw new Error("Firebase Admin is not initialized in this environment");
}

// Middleware to authenticate requests
export async function authenticateRequest(authHeader: string | null) {
  // 始终返回未认证状态，这是一个桩实现
  return {
    isAuthenticated: false,
    uid: null,
    error: "Firebase Admin is not initialized in this environment",
  };
}

// 导出默认对象
export default {
  authenticateRequest,
  verifyIdToken,
};
