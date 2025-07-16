// controllers/notification.controller.js

import User from "../models/user.model.js";

export const saveFCMToken = async (req, res) => {
  try {
    const { token, userId } = req.body;
    if (!token || !userId) {
      return res.status(400).json({ message: "Missing token or userId" });
    }

    await User.findByIdAndUpdate(userId, { fcmToken: token });
    res.status(200).json({ message: "Token saved successfully" });
  } catch (err) {
    console.error("❌ Failed to save FCM token:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
