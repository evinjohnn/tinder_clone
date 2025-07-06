// api/routes/authRoutes.js
import express from "express";
import { 
    signup, 
    login, 
    logout, 
    refreshToken, 
    updateOnlineStatus, 
    getProfile,
    authLimiter 
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);

// Protected routes
router.get("/me", protectRoute, getProfile);
router.put("/online-status", protectRoute, updateOnlineStatus);

export default router;