// api/routes/matchRoutes.js
import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
    getDiscoverFeed,
    getStandoutsFeed,
    sendLike,
    getIncomingLikes,
    getMatches,
    likeProfile,
    superLikeProfile,
    sendRose,
    passProfile,
    undoLastAction,
    boostProfile,
    getCompatibilityScore
} from "../controllers/matchController.js";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Discovery feeds
router.get("/discover", getDiscoverFeed);
router.get("/standouts", getStandoutsFeed);

// Matching actions
router.post("/like/:receiverId", sendLike);
router.post("/super-like/:userId", superLikeProfile);
router.post("/rose/:userId", sendRose);
router.post("/pass/:userId", passProfile);
router.post("/undo", undoLastAction);

// Profile interactions
router.get("/likes/incoming", getIncomingLikes);
router.get("/", getMatches);
router.get("/compatibility/:userId", getCompatibilityScore);

// Premium features
router.post("/boost", boostProfile);

export default router;