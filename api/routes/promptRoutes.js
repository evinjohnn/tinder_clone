// api/routes/promptRoutes.js
import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import {
    getPromptCategories,
    getPromptsByCategory,
    recordPromptUsage,
    getPopularPrompts
} from '../controllers/promptController.js';

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Get all prompt categories
router.get('/categories', getPromptCategories);

// Get prompts by category
router.get('/category/:categoryName', getPromptsByCategory);

// Record prompt usage (for analytics)
router.post('/usage', recordPromptUsage);

// Get popular prompts
router.get('/popular', getPopularPrompts);

export default router;