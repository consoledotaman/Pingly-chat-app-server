import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import notificationRoutes from "./routes/notification.routes.js";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import {app,server} from "./lib/socket.js";
import path from "path";
dotenv.config();

const PORT=process.env.PORT;
const __dirname= path.resolve();
const allowedOrigins = [
  "https://pingly-chat.vercel.app/", 
];
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


app.get("/", (req, res) => {
  res.send("Backend is live");
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

if (process.env.NODE_ENV == "production" ){
  app.use(express.static(path.join(__dirname,"../frontend/dist")));

  app.get("/*", (req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
  })
}

server.listen(PORT,()=>{
    console.log("Server is running on PORT:" +PORT);
    connectDB();
})