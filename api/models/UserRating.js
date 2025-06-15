// api/models/UserRating.js
import mongoose from 'mongoose';

const userRatingSchema = new mongoose.Schema({
    rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchId: { type: mongoose.Schema.Types.ObjectId, required: true }, // To link to a specific interaction
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500 }
}, { timestamps: true });

userRatingSchema.index({ rater: 1, matchId: 1 }, { unique: true });

const UserRating = mongoose.model('UserRating', userRatingSchema);
export default UserRating;