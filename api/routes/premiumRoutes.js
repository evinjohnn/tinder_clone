// api/routes/premiumRoutes.js
import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
    getPremiumStatus,
    purchasePremium,
    useAdvancedFilters,
    activateIncognitoMode,
    deactivateIncognitoMode,
    usePassport,
    resetDailyLimits,
    getFeatureUsage
} from "../controllers/premiumController.js";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Premium status
router.get("/status", getPremiumStatus);
router.get("/features", getFeatureUsage);

// Premium purchase
router.post("/purchase", purchasePremium);

// Premium features
router.post("/filters", useAdvancedFilters);
router.post("/incognito", activateIncognitoMode);
router.delete("/incognito", deactivateIncognitoMode);
router.post("/passport", usePassport);

// Admin routes (for cron jobs)
router.post("/reset-limits", resetDailyLimits);

export default router;