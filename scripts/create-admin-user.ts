import * as dotenv from "dotenv";
dotenv.config();

import { getAdminAuth } from "../packages/firebase/src/admin";

async function createAdminUser() {
  const auth = getAdminAuth();
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123456";

  console.log(`Setting up admin user: ${email}...`);

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`Existing user found: ${userRecord.uid}`);
    // Update password if needed
    await auth.updateUser(userRecord.uid, { password });
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      userRecord = await auth.createUser({
        email,
        password,
        emailVerified: true,
      });
      console.log(`Created new user: ${userRecord.uid}`);
    } else {
      throw error;
    }
  }

  // Set custom claims: { admin: true, roles: ["admin"] }
  await auth.setCustomUserClaims(userRecord.uid, {
    admin: true,
    roles: ["admin"],
  });
  console.log(`✔ Set admin custom claims for ${email}`);
  console.log(`\n🎉 Admin user is ready!`);
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
}

createAdminUser().catch((err) => {
  console.error("Failed to create admin user:", err);
  process.exit(1);
});
