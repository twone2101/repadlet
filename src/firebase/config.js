import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const STORAGE_KEY_FIREBASE_CONFIG = 'padlet_firebase_user_config';

// 1. Default Built-in Config (fir-project-81793 자동 연동)
export const DEFAULT_FIREBASE_CONFIG = {
  projectId: "fir-project-81793",
  appId: "1:612957505088:web:98ebf6a909261f678d81a5",
  storageBucket: "fir-project-81793.firebasestorage.app",
  apiKey: "AIzaSyA4d5BdwSnWNCGXE0Lg4YZEh9IhIgMN8To",
  authDomain: "fir-project-81793.firebaseapp.com",
  messagingSenderId: "612957505088",
  source: 'builtin'
};

// 2. Check environment variables
export function getEnvFirebaseConfig() {
  const env = import.meta.env;
  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
      source: 'env'
    };
  }
  return null;
}

// 3. Check UI-saved custom config
export function getSavedFirebaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return { ...parsed, source: 'ui' };
      }
    }
  } catch (e) {
    console.error('Failed to read saved Firebase config', e);
  }
  return null;
}

export function saveUserFirebaseConfig(config) {
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
}

export function removeUserFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
}

// Active Firebase App & DB instances
let currentApp = null;
let currentDb = null;

export function initFirebase() {
  // Priority: 1) Saved in UI -> 2) Environment variables -> 3) Built-in Default Config
  const config = getSavedFirebaseConfig() || getEnvFirebaseConfig() || DEFAULT_FIREBASE_CONFIG;

  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, db: null, config: null };
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      currentApp = existingApps[0];
    } else {
      currentApp = initializeApp(config);
    }
    currentDb = getFirestore(currentApp);
    return { app: currentApp, db: currentDb, config };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, db: null, config: null, error };
  }
}
