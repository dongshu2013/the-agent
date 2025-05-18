// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB9c8GN34MDCJHw5RPAJ2uF3inuTtXJNFU',
  authDomain: 'mysta-ai.firebaseapp.com',
  projectId: 'mysta-ai',
  storageBucket: 'mysta-ai.firebasestorage.app',
  messagingSenderId: '711124970552',
  appId: '1:711124970552:web:5d45e76dbd0a291257cacd',
  measurementId: 'G-RMZHZS9PYZ',
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
