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
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      isValid: true,
    };
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return { isValid: false, uid: null, email: null };
  }
}

// Middleware to authenticate requests
export async function authenticateRequest(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      isAuthenticated: false,
      uid: null,
      error: "Missing or invalid authorization header",
    };
  }

  const idToken = authHeader.split("Bearer ")[1];
  const { isValid, uid, email } = await verifyIdToken(idToken);

  if (!isValid || !uid) {
    return { isAuthenticated: false, uid: null, error: "Invalid ID token" };
  }

  return { isAuthenticated: true, uid, email };
}
