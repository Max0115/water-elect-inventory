import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const env = (import.meta as any).env || {};

export const hasValidConfig = Boolean(
  env.VITE_FIREBASE_API_KEY && 
  env.VITE_FIREBASE_API_KEY !== 'undefined' && 
  !env.VITE_FIREBASE_API_KEY.includes('your_')
);

const firebaseConfig = hasValidConfig ? {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
} : {
  apiKey: 'AIzaSyDemoFallbackKeyForLocalDevOnly123456',
  authDomain: 'water-elect-demo.firebaseapp.com',
  projectId: 'water-elect-demo',
  storageBucket: 'water-elect-demo.appspot.com',
  messagingSenderId: '100000000000',
  appId: '1:100000000000:web:demoFallback123456',
};

let app: any;
let db: any;
let auth: any;

try {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.warn('Firebase initialization error, running in offline fallback mode:', e);
}

export { app, db, auth };