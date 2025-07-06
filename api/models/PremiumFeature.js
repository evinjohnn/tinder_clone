// api/models/PremiumFeature.js
import mongoose from 'mongoose';

const premiumFeatureSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    featureType: {
        type: String,
        enum: ['super_like', 'boost', 'rewind', 'passport', 'incognito', 'read_receipts', 'advanced_filters'],
        required: true
    },
    usageCount: { type: Number, default: 0 },
    lastUsed: { type: Date },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    
    // Boost specific
    boostDuration: { type: Number }, // in minutes
    boostMultiplier: { type: Number, default: 10 },
    
    // Passport specific
    passportLocation: {
        city: String,
        country: String,
        coordinates: [Number]
    },
    
    // Advanced filters
    filters: {
        education: [String],
        occupation: [String],
        height: { min: Number, max: Number },
        interests: [String],
        lifestyle: Object
    }
}, { timestamps: true });

const PremiumFeature = mongoose.model('PremiumFeature', premiumFeatureSchema);
export default PremiumFeature;