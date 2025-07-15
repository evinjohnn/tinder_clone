// api/controllers/enhancedAiController.js
import { enhancedGeminiAI } from '../utils/enhancedGeminiAI.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import AIConversation from '../models/AIConversation.js';

export const getPersonalizedIceBreakers = async (req, res) => {
    try {
        const { matchId } = req.params;
        
        const currentUser = await User.findById(req.user.id);
        const matchUser = await User.findById(matchId);
        
        if (!matchUser) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        const iceBreakers = await enhancedGeminiAI.generatePersonalizedIceBreakers(
            currentUser,
            matchUser
        );

        res.status(200).json({
            success: true,
            iceBreakers
        });
    } catch (error) {
        console.log('Error in getPersonalizedIceBreakers:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const generateDateIdeas = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { preferences = {} } = req.body;
        
        const currentUser = await User.findById(req.user.id);
        const matchUser = await User.findById(matchId);
        
        if (!matchUser) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        const dateIdeas = await enhancedGeminiAI.generateDateIdeas(
            currentUser,
            matchUser,
            preferences
        );

        res.status(200).json({
            success: true,
            dateIdeas
        });
    } catch (error) {
        console.log('Error in generateDateIdeas:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getConversationTopics = async (req, res) => {
    try {
        const { matchId } = req.params;
        
        const currentUser = await User.findById(req.user.id);
        const matchUser = await User.findById(matchId);
        
        if (!matchUser) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        // Get recent conversation history
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: matchId },
                { sender: matchId, receiver: req.user.id }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('sender', 'name');

        const conversationHistory = messages.reverse().map(msg => ({
            senderName: msg.sender.name,
            content: msg.content,
            timestamp: msg.createdAt
        }));

        const topics = await enhancedGeminiAI.generateConversationTopics(
            currentUser,
            matchUser,
            conversationHistory
        );

        res.status(200).json({
            success: true,
            topics
        });
    } catch (error) {
        console.log('Error in getConversationTopics:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const analyzeCompatibility = async (req, res) => {
    try {
        const { matchId } = req.params;
        
        const currentUser = await User.findById(req.user.id);
        const matchUser = await User.findById(matchId);
        
        if (!matchUser) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        const compatibility = await enhancedGeminiAI.analyzeCompatibility(
            currentUser,
            matchUser
        );

        // Cache the analysis
        await AIConversation.findOneAndUpdate(
            { userId: req.user.id, matchId },
            {
                $set: {
                    compatibilityAnalysis: {
                        ...compatibility,
                        analyzedAt: new Date()
                    }
                }
            },
            { upsert: true }
        );

        res.status(200).json({
            success: true,
            compatibility
        });
    } catch (error) {
        console.log('Error in analyzeCompatibility:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getFlirtingTips = async (req, res) => {
    try {
        const { matchId } = req.params;
        
        const currentUser = await User.findById(req.user.id);
        const matchUser = await User.findById(matchId);
        
        if (!matchUser) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        // Get recent conversation history
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: matchId },
                { sender: matchId, receiver: req.user.id }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('sender', 'name');

        const conversationHistory = messages.reverse().map(msg => ({
            senderName: msg.sender.name,
            content: msg.content
        }));

        const flirtingTips = await enhancedGeminiAI.generateFlirtingTips(
            currentUser,
            matchUser,
            conversationHistory
        );

        res.status(200).json({
            success: true,
            flirtingTips
        });
    } catch (error) {
        console.log('Error in getFlirtingTips:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const analyzeRedFlags = async (req, res) => {
    try {
        const { matchId } = req.params;
        
        // Get recent messages for analysis
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: matchId },
                { sender: matchId, receiver: req.user.id }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('sender', 'name');

        const messageHistory = messages.reverse().map(msg => ({
            senderName: msg.sender.name,
            content: msg.content
        }));

        if (messageHistory.length === 0) {
            return res.status(200).json({
                success: true,
                analysis: {
                    riskLevel: 'low',
                    flags: [],
                    advice: 'No conversation history to analyze'
                }
            });
        }

        const analysis = await enhancedGeminiAI.generateRedFlagAnalysis(messageHistory);

        res.status(200).json({
            success: true,
            analysis
        });
    } catch (error) {
        console.log('Error in analyzeRedFlags:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getAICoachingDashboard = async (req, res) => {
    try {
        const { matchId } = req.params;
        
        const aiConversation = await AIConversation.findOne({
            userId: req.user.id,
            matchId
        });

        if (!aiConversation) {
            return res.status(404).json({ 
                success: false, 
                message: 'No AI coaching data available' 
            });
        }

        const dashboard = {
            conversationStage: aiConversation.context?.conversationStage || 'opening',
            compatibilityScore: aiConversation.compatibilityAnalysis?.score || 75,
            moodAnalysis: aiConversation.moodAnalysis,
            suggestionsUsed: aiConversation.suggestions?.filter(s => s.used).length || 0,
            totalSuggestions: aiConversation.suggestions?.length || 0,
            averageEffectiveness: aiConversation.suggestions?.length > 0 ? 
                aiConversation.suggestions.reduce((sum, s) => sum + (s.effectiveness || 0), 0) / aiConversation.suggestions.length : 0,
            lastCoachingUpdate: aiConversation.updatedAt
        };

        res.status(200).json({
            success: true,
            dashboard
        });
    } catch (error) {
        console.log('Error in getAICoachingDashboard:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};