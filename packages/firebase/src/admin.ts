import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

let initializedApp: admin.app.App;

export function getFirebaseAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  let serviceAccount: any = null;

  // 1. Check FIREBASE_SERVICE_ACCOUNT_KEY (raw JSON or base64)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
    try {
      if (raw.startsWith("{")) {
        serviceAccount = JSON.parse(raw);
      } else {
        const decoded = Buffer.from(raw, "base64").toString("utf-8");
        serviceAccount = JSON.parse(decoded);
      }
    } catch (e) {
      console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
    }
  }

  // 2. Check individual credentials (FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY)
  if (
    !serviceAccount &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    serviceAccount = {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      project_id:
        process.env.FIREBASE_PROJECT_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
        "miraigikai",
    };
  }

  // 3. Check candidate file paths
  if (!serviceAccount) {
    const candidatePaths = [
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
      path.resolve(process.cwd(), "service-account.json"),
      path.resolve(process.cwd(), "../service-account.json"),
      path.resolve(process.cwd(), "../../service-account.json"),
      path.resolve(__dirname, "../../../service-account.json"),
      path.resolve(__dirname, "../../../../service-account.json"),
    ].filter(Boolean) as string[];

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
  try {
    initializedApp = admin.initializeApp({
      projectId:
        process.env.FIREBASE_PROJECT_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
        "miraigikai",
      storageBucket:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        "miraigikai.firebasestorage.app",
    });
    return initializedApp;
  } catch (err) {
    console.warn(
      "Failed to initialize Firebase Admin with default credentials:",
      err
    );
    return admin.initializeApp(
      {
        projectId:
          process.env.FIREBASE_PROJECT_ID ||
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
          "miraigikai",
      },
      "build-fallback"
    );
  }
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
