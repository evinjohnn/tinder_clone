// api/models/Like.js
import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // To identify which photo or prompt was liked
    likedContent: {
        type: String, // e.g., "Photo 1" or "Prompt: A shower thought I recently had"
        required: true
    },
    comment: {
        type: String,
        maxlength: 255
    },
    status: {
        type: String,
        enum: ['pending', 'matched'],
        default: 'pending'
    },
    isRose: { type: Boolean, default: false } // NEW: Flag for roses
}, { timestamps: true });

// Ensure a user can only like another user's content once
likeSchema.index({ sender: 1, receiver: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

export default Like;