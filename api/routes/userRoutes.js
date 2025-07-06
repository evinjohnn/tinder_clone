// api/routes/userRoutes.js
import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { 
    updateProfile,
    uploadPhotoVerification,
    updatePrivacySettings,
    updatePreferences,
    blockUser,
    unblockUser,
    reportUser,
    getUserProfile,
    deleteAccount
} from "../controllers/userController.js";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Profile management
router.put("/update", updateProfile);
router.post("/verify-photo", uploadPhotoVerification);
router.get("/profile/:userId", getUserProfile);

// Settings
router.put("/privacy", updatePrivacySettings);
router.put("/preferences", updatePreferences);

// User interactions
router.post("/block/:userId", blockUser);
router.delete("/block/:userId", unblockUser);
router.post("/report/:userId", reportUser);

// Account management
router.delete("/account", deleteAccount);

export default router;