// api/routes/enhancedAiRoutes.js
import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import {
    getPersonalizedIceBreakers,
    generateDateIdeas,
    getConversationTopics,
    analyzeCompatibility,
    getFlirtingTips,
    analyzeRedFlags,
    getAICoachingDashboard
} from '../controllers/enhancedAiController.js';

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Enhanced AI features
router.get('/icebreakers/:matchId', getPersonalizedIceBreakers);
router.post('/date-ideas/:matchId', generateDateIdeas);
router.get('/conversation-topics/:matchId', getConversationTopics);
router.get('/compatibility/:matchId', analyzeCompatibility);
router.get('/flirting-tips/:matchId', getFlirtingTips);
router.get('/safety-analysis/:matchId', analyzeRedFlags);
router.get('/dashboard/:matchId', getAICoachingDashboard);

export default router;