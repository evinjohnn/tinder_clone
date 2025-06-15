// api/models/Report.js
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reported: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'reviewed_valid', 'reviewed_invalid'], default: 'pending' },
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
export default Report;