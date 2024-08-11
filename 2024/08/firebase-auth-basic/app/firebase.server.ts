import {AppOptions, initializeApp, applicationDefault, getApps, getApp } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";

const firebaseAdminConfig = {
  credential: applicationDefault(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
} as const satisfies AppOptions;

const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApp();
const adminAuth = getAdminAuth(app);

export { adminAuth };