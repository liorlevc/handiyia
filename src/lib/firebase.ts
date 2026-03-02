import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const apiKey     = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const projectId  = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;

// Only initialize Firebase when real credentials are provided.
// If env vars are missing or still hold placeholder text, skip entirely so
// the app works without Firebase (profile falls back to localStorage).
const isConfigured =
  !!apiKey &&
  apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  !!projectId &&
  projectId !== 'YOUR_FIREBASE_PROJECT_ID';

let app:  FirebaseApp | null = null;
let db:   Firestore   | null = null;
let auth: Auth        | null = null;

if (isConfigured) {
  const firebaseConfig = {
    apiKey,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  };

  app  = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  db   = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };
export default app;
