// api/routes/aiRoutes.js
import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
    getChatSuggestions,
    getConversationStarters,
    analyzeMood,
    markSuggestionUsed,
    getAIInsights,
    updateAISettings
} from "../controllers/aiController.js";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// AI chat assistance
router.get("/suggestions/:matchId", getChatSuggestions);
router.get("/starters/:matchId", getConversationStarters);
router.get("/mood/:matchId", analyzeMood);
router.get("/insights/:matchId", getAIInsights);

// AI interaction tracking
router.put("/suggestion/:matchId/:suggestionId", markSuggestionUsed);

// AI settings
router.put("/settings", updateAISettings);

export default router;