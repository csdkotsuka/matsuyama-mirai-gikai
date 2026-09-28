import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

let initializedApp: admin.app.App;

export function getFirebaseAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const candidatePaths = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    path.resolve(process.cwd(), "service-account.json"),
    path.resolve(process.cwd(), "../service-account.json"),
    path.resolve(process.cwd(), "../../service-account.json"),
    path.resolve(__dirname, "../../../service-account.json"),
    path.resolve(__dirname, "../../../../service-account.json"),
  ].filter(Boolean) as string[];

  let serviceAccount: any = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:", e);
    }
  }

  if (!serviceAccount) {
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          const fileContent = fs.readFileSync(p, "utf-8");
          serviceAccount = JSON.parse(fileContent);
          break;
        } catch (err) {
          console.warn(`Failed to read service account at ${p}:`, err);
        }
      }
    }
  }

  if (serviceAccount) {
    initializedApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
      storageBucket:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        `${serviceAccount.project_id}.firebasestorage.app`,
    });
    return initializedApp;
  }

  // Fallback to application default credentials / env
  initializedApp = admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "miraigikai",
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      "miraigikai.firebasestorage.app",
  });

  return initializedApp;
}

export function getAdminFirestore() {
  const app = getFirebaseAdminApp();
  return admin.firestore(app);
}

export function getAdminAuth() {
  const app = getFirebaseAdminApp();
  return admin.auth(app);
}

export function getAdminStorage() {
  const app = getFirebaseAdminApp();
  return admin.storage(app);
}
