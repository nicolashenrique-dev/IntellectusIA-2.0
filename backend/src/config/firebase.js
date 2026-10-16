import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';

const projectId = process.env.FIREBASE_PROJECT_ID || 'intelectusai';
const account = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!getApps().length) {
  // Invalid explicit credentials must never silently enable local storage.
  initializeApp(account ? { projectId, credential: cert(JSON.parse(account)) } : { projectId });
}
const adminDb = account ? getFirestore() : null;
const admin = {
  get apps() {
    return getApps();
  },
  auth: getAuth,
};
export { admin, adminDb };
export default admin;
