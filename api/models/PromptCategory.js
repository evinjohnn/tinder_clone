// api/models/PromptCategory.js
import mongoose from 'mongoose';

const promptCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['personality', 'lifestyle', 'relationship']
    },
    displayName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    prompts: [{
        text: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        popularity: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }]
}, { timestamps: true });

const PromptCategory = mongoose.model('PromptCategory', promptCategorySchema);

export default PromptCategory;