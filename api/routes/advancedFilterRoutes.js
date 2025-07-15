// api/routes/advancedFilterRoutes.js
import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import {
    getAdvancedFilters,
    applyAdvancedFilters,
    clearAdvancedFilters
} from '../controllers/advancedFilterController.js';

const router = express.Router();

// All routes are protected and premium-only
router.use(protectRoute);

// Get available filter options and saved filters
router.get('/', getAdvancedFilters);

// Apply advanced filters
router.post('/apply', applyAdvancedFilters);

// Clear saved filters
router.delete('/clear', clearAdvancedFilters);

export default router;