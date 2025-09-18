
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth as getFirebaseAuth, GoogleAuthProvider, browserSessionPersistence, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
