import { FirebaseOptions, initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, getIdToken, GoogleAuthProvider, signInWithPopup } from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
} as const satisfies FirebaseOptions;

const authApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(authApp);

const signInWithGoogle = async (): Promise<string | null> => {
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    return await getIdToken(result.user)
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return null;
  }
};

export { signInWithGoogle };
