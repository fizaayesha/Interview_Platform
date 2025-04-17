import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
const apps = getApps()
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,       
}

console.log("SERVICE ACCOUNT", serviceAccount);

const app =
  apps.length === 0
    ? initializeApp({
        credential: cert(serviceAccount as any),
      })
    : apps[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
