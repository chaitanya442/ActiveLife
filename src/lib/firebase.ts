
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth as getFirebaseAuth, GoogleAuthProvider, browserSessionPersistence, setPersistence } from "firebase/auth";
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig() || {};

const firebaseConfig = {
  apiKey: publicRuntimeConfig.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: publicRuntimeConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: publicRuntimeConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: publicRuntimeConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: publicRuntimeConfig.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: publicRuntimeConfig.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const googleProvider = new GoogleAuthProvider();

let authInstance: ReturnType<typeof getFirebaseAuth> | null = null;

const getAuth = () => {
    if (!authInstance) {
        const auth = getFirebaseAuth(app);
        setPersistence(auth, browserSessionPersistence);
        authInstance = auth;
    }
    return authInstance;
}

export { app, googleProvider, getAuth };
