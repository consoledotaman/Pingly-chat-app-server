import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { sendPushNotification } from "../lib/firebaseAdmin.js";



import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    // ✅ Upload image to Cloudinary if present
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // ✅ Save message to DB
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // ✅ Emit message via socket (real-time)
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    
    // ✅ Push Notification logic
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);
    console.log("📲 Sending push to:", receiver.fcmToken);

    if (receiver?.fcmToken) {
      const title = `💬 New message from ${sender?.fullName || "Someone"}`;
      const body = text
        ? text.length > 100
          ? text.slice(0, 100) + "..."
          : text
        : "📷 You received a new image";

      await sendPushNotification(receiver.fcmToken, title, body);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("❌ Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};