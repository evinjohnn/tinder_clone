// api/routes/matchRoutes.js
import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
	getMatches,
	getDiscoverFeed,
	sendLike,
	getIncomingLikes,
	getStandoutsFeed,
} from "../controllers/matchController.js";

const router = express.Router();

router.use(protectRoute);

router.get("/discover", getDiscoverFeed);
router.get("/standouts", getStandoutsFeed);
router.post("/like/:receiverId", sendLike);
router.get("/likes/incoming", getIncomingLikes);
router.get("/", getMatches); // Matches are conversations

export default router;