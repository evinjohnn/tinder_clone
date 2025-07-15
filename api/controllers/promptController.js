// api/controllers/promptController.js
import PromptCategory from '../models/PromptCategory.js';
import User from '../models/User.js';

export const getPromptCategories = async (req, res) => {
    try {
        const categories = await PromptCategory.find({});
        
        // If no categories exist, create default ones
        if (categories.length === 0) {
            await createDefaultCategories();
            const newCategories = await PromptCategory.find({});
            return res.status(200).json({
                success: true,
                categories: newCategories
            });
        }

        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.log('Error in getPromptCategories:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getPromptsByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const { limit = 10 } = req.query;
        
        const category = await PromptCategory.findOne({ name: categoryName });
        
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Get active prompts, sorted by popularity
        const prompts = category.prompts
            .filter(prompt => prompt.isActive)
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, parseInt(limit));

        res.status(200).json({
            success: true,
            category: {
                name: category.name,
                displayName: category.displayName,
                description: category.description
            },
            prompts
        });
    } catch (error) {
        console.log('Error in getPromptsByCategory:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const recordPromptUsage = async (req, res) => {
    try {
        const { categoryName, promptText } = req.body;
        
        await PromptCategory.findOneAndUpdate(
            { name: categoryName, 'prompts.text': promptText },
            { $inc: { 'prompts.$.popularity': 1 } }
        );

        res.status(200).json({
            success: true,
            message: 'Prompt usage recorded'
        });
    } catch (error) {
        console.log('Error in recordPromptUsage:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getPopularPrompts = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        
        const categories = await PromptCategory.find({});
        const allPrompts = [];

        categories.forEach(category => {
            category.prompts.forEach(prompt => {
                if (prompt.isActive) {
                    allPrompts.push({
                        ...prompt.toObject(),
                        categoryName: category.name,
                        categoryDisplayName: category.displayName
                    });
                }
            });
        });

        // Sort by popularity and return top prompts
        const popularPrompts = allPrompts
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, parseInt(limit));

        res.status(200).json({
            success: true,
            prompts: popularPrompts
        });
    } catch (error) {
        console.log('Error in getPopularPrompts:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Helper function to create default categories
const createDefaultCategories = async () => {
    const defaultCategories = [
        {
            name: 'personality',
            displayName: 'Personality',
            description: 'Show your unique personality and quirks',
            prompts: [
                { text: "I'm looking for...", category: 'personality' },
                { text: "A shower thought I recently had...", category: 'personality' },
                { text: "I get way too competitive about...", category: 'personality' },
                { text: "My most controversial opinion is...", category: 'personality' },
                { text: "The way to win me over is...", category: 'personality' },
                { text: "I'm weirdly attracted to...", category: 'personality' },
                { text: "My simple pleasures...", category: 'personality' },
                { text: "Two truths and a lie...", category: 'personality' },
                { text: "I go crazy for...", category: 'personality' },
                { text: "My biggest dating red flag is...", category: 'personality' },
                { text: "Something that makes me laugh...", category: 'personality' },
                { text: "I'm secretly really good at...", category: 'personality' },
                { text: "My most useless talent is...", category: 'personality' },
                { text: "I'm probably going to hell for...", category: 'personality' },
                { text: "The key to my heart is...", category: 'personality' }
            ]
        },
        {
            name: 'lifestyle',
            displayName: 'Lifestyle',
            description: 'Share your daily life and interests',
            prompts: [
                { text: "My perfect Sunday involves...", category: 'lifestyle' },
                { text: "I spend way too much money on...", category: 'lifestyle' },
                { text: "My guilty pleasure is...", category: 'lifestyle' },
                { text: "I can't live without...", category: 'lifestyle' },
                { text: "My ideal vacation is...", category: 'lifestyle' },
                { text: "I'm passionate about...", category: 'lifestyle' },
                { text: "My favorite way to unwind is...", category: 'lifestyle' },
                { text: "I collect...", category: 'lifestyle' },
                { text: "My dream job would be...", category: 'lifestyle' },
                { text: "I'm currently reading/watching...", category: 'lifestyle' },
                { text: "My biggest fear is...", category: 'lifestyle' },
                { text: "I'm learning how to...", category: 'lifestyle' },
                { text: "My favorite childhood memory is...", category: 'lifestyle' },
                { text: "I volunteer for...", category: 'lifestyle' },
                { text: "My bucket list includes...", category: 'lifestyle' }
            ]
        },
        {
            name: 'relationship',
            displayName: 'Relationship',
            description: 'Express what you want in a relationship',
            prompts: [
                { text: "The best way to ask me out is...", category: 'relationship' },
                { text: "I'll know I found the one when...", category: 'relationship' },
                { text: "My love language is...", category: 'relationship' },
                { text: "In a relationship, I value...", category: 'relationship' },
                { text: "My ideal first date is...", category: 'relationship' },
                { text: "I'm attracted to people who...", category: 'relationship' },
                { text: "My relationship dealbreaker is...", category: 'relationship' },
                { text: "I show I care by...", category: 'relationship' },
                { text: "My idea of romance is...", category: 'relationship' },
                { text: "I need someone who...", category: 'relationship' },
                { text: "My perfect partner would...", category: 'relationship' },
                { text: "I'm looking for someone to...", category: 'relationship' },
                { text: "In love, I'm...", category: 'relationship' },
                { text: "My relationship superpower is...", category: 'relationship' },
                { text: "I want to grow old with someone who...", category: 'relationship' }
            ]
        }
    ];

    await PromptCategory.insertMany(defaultCategories);
};