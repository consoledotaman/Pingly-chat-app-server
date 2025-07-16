import express from "express";
import { saveFCMToken } from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/save-token", saveFCMToken);

export default router;
