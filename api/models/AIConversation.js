// api/models/AIConversation.js
import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    context: {
        userProfile: Object,
        matchProfile: Object,
        conversationHistory: Array,
        currentMood: String,
        conversationStage: {
            type: String,
            enum: ['opening', 'getting_to_know', 'building_rapport', 'deeper_connection', 'planning_date'],
            default: 'opening'
        }
    },
    suggestions: [{
        type: String,
        timestamp: { type: Date, default: Date.now },
        used: { type: Boolean, default: false },
        effectiveness: { type: Number, default: 0 } // 1-5 rating
    }],
    conversationStarters: [{
        type: String,
        basedOn: String, // what it's based on from their profile
        timestamp: { type: Date, default: Date.now }
    }],
    moodAnalysis: {
        currentMood: String,
        confidence: Number,
        suggestedApproach: String,
        lastAnalyzed: { type: Date, default: Date.now }
    }
}, { timestamps: true });

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
export default AIConversation;