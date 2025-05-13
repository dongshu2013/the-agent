// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAXapksFw-knh3zLJoW6JgaIi3yjUEXq2s',
  authDomain: 'ashcoin-51786.firebaseapp.com',
  projectId: 'ashcoin-51786',
  storageBucket: 'ashcoin-51786.firebasestorage.app',
  messagingSenderId: '516883683169',
  appId: '1:516883683169:web:471b7dfda5b285424b1720',
  measurementId: 'G-X8X8MKMGPL',
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
