import * as dotenv from "dotenv";
dotenv.config();

import * as readline from "readline";
import { getAdminAuth } from "../packages/firebase/src/admin";

function prompt(question: string, isSecret = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (isSecret) {
      // Hide password input
      process.stdout.write(question);
      const stdin = process.stdin;
      const wasRaw = stdin.isRaw;
      if (stdin.isTTY) {
        stdin.setRawMode(true);
      }
      let input = "";
      const onData = (char: Buffer) => {
        const c = char.toString();
        if (c === "\n" || c === "\r") {
          if (stdin.isTTY) stdin.setRawMode(wasRaw ?? false);
          stdin.removeListener("data", onData);
          process.stdout.write("\n");
          rl.close();
          resolve(input);
        } else if (c === "\u007f" || c === "\b") {
          // Backspace
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else if (c === "\u0003") {
          // Ctrl+C
          process.exit(0);
        } else {
          input += c;
          process.stdout.write("*");
        }
      };
      stdin.on("data", onData);
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

async function createAdminUser() {
  const auth = getAdminAuth();
  const defaultEmail = process.env.ADMIN_EMAIL || "kotsuka@creativesd.net";

  // Interactive mode if no ADMIN_PASSWORD env var
  let email = defaultEmail;
  let password = process.env.ADMIN_PASSWORD || "";

  if (!process.env.ADMIN_PASSWORD && process.stdin.isTTY) {
    console.log("🔐 Admin User Setup\n");

    const inputEmail = await prompt(`Email [${defaultEmail}]: `);
    if (inputEmail.trim()) {
      email = inputEmail.trim();
    }

    password = await prompt("Password: ", true);
    if (!password || password.length < 6) {
      console.error("❌ Password must be at least 6 characters.");
      process.exit(1);
    }

    const confirmPassword = await prompt("Confirm Password: ", true);
    if (password !== confirmPassword) {
      console.error("❌ Passwords do not match.");
      process.exit(1);
    }
  } else if (!password) {
    console.error(
      "❌ ADMIN_PASSWORD env var is required in non-interactive mode.",
    );
    process.exit(1);
  }

  console.log(`\nSetting up admin user: ${email}...`);

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`Existing user found: ${userRecord.uid}`);
    // Update password
    await auth.updateUser(userRecord.uid, { password });
    console.log("✔ Password updated.");
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
  console.log(`Email: ${email}`);
}

createAdminUser().catch((err) => {
  console.error("Failed to create admin user:", err);
  process.exit(1);
});
