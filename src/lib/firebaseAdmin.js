// backend/src/lib/firebaseAdmin.js
import admin from "firebase-admin";

if (!process.env.FIREBASE_CONFIG) {
  throw new Error("❌ FIREBASE_CONFIG env variable is not set.");
}

const raw = JSON.parse(process.env.FIREBASE_CONFIG);

// 🔥 Replace \\n with real line breaks
raw.private_key = raw.private_key.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(raw),
  });
}


export const sendPushNotification = async (fcmToken, title, body) => {
  try {
    const message = {
      notification: { title, body },
      token: fcmToken,
    };
    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);
  } catch (error) {
    console.error("❌ Failed to send notification:", error);
  }
};
