import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 必須以靜態方式直接存取 import.meta.env.VITE_*，以利 Vite 在生產建置時正確替換環境變數
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

export const hasValidConfig = Boolean(
  apiKey && 
  apiKey !== 'undefined' && 
  !apiKey.includes('your_') &&
  projectId &&
  projectId !== 'undefined'
);

const firebaseConfig = hasValidConfig ? {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
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