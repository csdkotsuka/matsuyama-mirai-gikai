import * as dotenv from "dotenv";
dotenv.config();

import { getAdminFirestore } from "../packages/firebase/src/admin";
import {
  bills,
  tags,
  dietSessions,
  createMiraiStances,
  createBillsTags,
  createInterviewConfig,
  createInterviewQuestions,
  createInterviewSessions,
  createInterviewMessages,
  createInterviewReports,
} from "../packages/seed/data";
import { createBillContents } from "../packages/seed/bill-contents-data";

async function clearCollection(db: FirebaseFirestore.Firestore, collectionName: string) {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

async function seedFirestore() {
  const db = getAdminFirestore();
  console.log("🌱 Starting Firestore seeding...");

  try {
    // 1. Clear existing collections
    console.log("🧹 Clearing existing collections...");
    const collectionsToClear = [
      "interview_reports",
      "interview_messages",
      "interview_sessions",
      "interview_questions",
      "interview_configs",
      "mirai_stances",
      "bill_contents",
      "bills",
      "tags",
      "diet_sessions",
    ];

    for (const col of collectionsToClear) {
      await clearCollection(db, col);
    }
    console.log("✅ Collections cleared.");

    // 2. Insert tags
    console.log("🏷️ Inserting tags...");
    const insertedTags: Array<{ id: string; label: string }> = [];
    for (const tag of tags) {
      const docRef = db.collection("tags").doc();
      const tagData = {
        ...tag,
        id: docRef.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await docRef.set(tagData);
      insertedTags.push({ id: docRef.id, label: tag.label });
    }
    console.log(`✅ Inserted ${insertedTags.length} tags`);

    // 3. Insert diet sessions
    console.log("🏛️ Inserting diet sessions...");
    const insertedDietSessions: Array<{ id: string; name: string }> = [];
    for (const session of dietSessions) {
      const docRef = db.collection("diet_sessions").doc();
      const sessionData = {
        ...session,
        id: docRef.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await docRef.set(sessionData);
      insertedDietSessions.push({ id: docRef.id, name: session.name });
    }
    console.log(`✅ Inserted ${insertedDietSessions.length} diet sessions`);

    // 4. Insert bills
    console.log("📜 Inserting bills...");
    const currentSession = insertedDietSessions[0];
    const previousSession = insertedDietSessions[1];

    const insertedBills: Array<{ id: string; name: string }> = [];
    for (let index = 0; index < bills.length; index++) {
      const bill = bills[index];
      const docRef = db.collection("bills").doc();
      const dietSessionId =
        index === 0
          ? currentSession.id
          : index === 1
          ? previousSession.id
          : index < 5
          ? currentSession.id
          : previousSession.id;

      const billData = {
        ...bill,
        id: docRef.id,
        diet_session_id: dietSessionId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tag_ids: [] as string[],
      };
      await docRef.set(billData);
      insertedBills.push({ id: docRef.id, name: bill.name });
    }
    console.log(`✅ Inserted ${insertedBills.length} bills`);

    // 5. Relate bills with tags
    console.log("🔗 Linking bills and tags...");
    const billsTags = createBillsTags(insertedBills, insertedTags);
    const billTagsMap = new Map<string, string[]>();
    for (const bt of billsTags) {
      if (!billTagsMap.has(bt.bill_id)) {
        billTagsMap.set(bt.bill_id, []);
      }
      billTagsMap.get(bt.bill_id)!.push(bt.tag_id);
    }
    for (const [billId, tagIds] of billTagsMap.entries()) {
      await db.collection("bills").doc(billId).update({ tag_ids: tagIds });
    }
    console.log(`✅ Linked tags to bills`);

    // 6. Insert bill contents
    console.log("📄 Inserting bill contents...");
    const billContents = createBillContents(insertedBills);
    for (const content of billContents) {
      const docRef = db.collection("bill_contents").doc();
      await docRef.set({
        ...content,
        id: docRef.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    console.log(`✅ Inserted ${billContents.length} bill contents`);

    // 7. Insert mirai stances
    console.log("⚖️ Inserting mirai stances...");
    const stances = createMiraiStances(insertedBills);
    for (const stance of stances) {
      const docRef = db.collection("mirai_stances").doc();
      await docRef.set({
        ...stance,
        id: docRef.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    console.log(`✅ Inserted ${stances.length} stances`);

    // 8. Insert interview configs and questions
    console.log("🎙️ Inserting interview configs & questions...");
    const config = createInterviewConfig(insertedBills);
    if (config) {
      const configDocRef = db.collection("interview_configs").doc();
      await configDocRef.set({
        ...config,
        id: configDocRef.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const questions = createInterviewQuestions(configDocRef.id);
      for (const q of questions) {
        const qDocRef = db.collection("interview_questions").doc();
        await qDocRef.set({
          ...q,
          id: qDocRef.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      console.log(`✅ Inserted interview config and ${questions.length} questions`);
    }

    console.log("\n🎉 Firestore database successfully seeded!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedFirestore();
