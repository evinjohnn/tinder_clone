// api/controllers/advancedFilterController.js
import User from '../models/User.js';
import PremiumFeature from '../models/PremiumFeature.js';

export const getAdvancedFilters = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user.isPremium) {
            return res.status(403).json({ 
                success: false, 
                message: 'Premium feature - Upgrade to use advanced filters' 
            });
        }

        // Get user's saved filters
        const savedFilters = await PremiumFeature.findOne({
            userId: req.user.id,
            featureType: 'advanced_filters'
        });

        const filterOptions = {
            education: [
                'High School',
                'Some College',
                'Undergraduate Degree',
                'Graduate Degree',
                'PhD/Professional Degree',
                'Trade School',
                'Other'
            ],
            occupation: [
                'Technology',
                'Healthcare',
                'Education',
                'Finance',
                'Creative',
                'Sales/Marketing',
                'Legal',
                'Engineering',
                'Business',
                'Government',
                'Non-Profit',
                'Retail',
                'Hospitality',
                'Other'
            ],
            lifestyle: {
                drinkingHabits: ['never', 'rarely', 'socially', 'regularly'],
                smokingHabits: ['never', 'rarely', 'socially', 'regularly'],
                fitnessLevel: ['never', 'rarely', 'sometimes', 'often', 'daily'],
                diet: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'other'],
                petPreference: ['love_all', 'dogs', 'cats', 'other', 'none'],
                relationshipGoals: ['casual', 'serious', 'marriage', 'unsure'],
                wantsChildren: ['yes', 'no', 'maybe']
            },
            personality: {
                introExtrovert: ['introvert', 'ambivert', 'extrovert'],
                adventureLevel: ['low', 'moderate', 'high', 'extreme'],
                humorStyle: ['dry', 'silly', 'witty', 'sarcastic', 'wholesome'],
                morningOrNight: ['morning_person', 'night_person', 'depends'],
                plannerOrSpontaneous: ['planner', 'spontaneous', 'mix']
            },
            interests: [
                'Travel', 'Cooking', 'Music', 'Movies', 'Books', 'Fitness', 'Art', 'Photography',
                'Dancing', 'Gaming', 'Sports', 'Hiking', 'Yoga', 'Wine', 'Coffee', 'Fashion',
                'Technology', 'Politics', 'Science', 'History', 'Languages', 'Volunteering',
                'Entrepreneurship', 'Writing', 'Theater', 'Comedy', 'Festivals', 'Meditation'
            ]
        };

        res.status(200).json({
            success: true,
            filterOptions,
            savedFilters: savedFilters?.filters || {}
        });
    } catch (error) {
        console.log('Error in getAdvancedFilters:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const applyAdvancedFilters = async (req, res) => {
    try {
        const { filters } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user.isPremium) {
            return res.status(403).json({ 
                success: false, 
                message: 'Premium feature - Upgrade to use advanced filters' 
            });
        }

        // Save filters to user's premium features
        await PremiumFeature.findOneAndUpdate(
            { userId: req.user.id, featureType: 'advanced_filters' },
            {
                filters,
                lastUsed: new Date(),
                $inc: { usageCount: 1 }
            },
            { upsert: true }
        );

        // Build match query based on filters
        const matchQuery = buildMatchQuery(filters, user);
        
        // Find matches with advanced filters
        const matches = await User.find(matchQuery)
            .select('name age images job school questionnaire credibilityScore behaviorIndex lastActive location')
            .limit(50);

        // Calculate match scores and sort
        const scoredMatches = matches.map(match => {
            const matchScore = user.calculateMatchScore(match);
            return {
                ...match.toObject(),
                matchScore
            };
        }).sort((a, b) => b.matchScore - a.matchScore);

        res.status(200).json({
            success: true,
            matches: scoredMatches,
            totalMatches: scoredMatches.length,
            filtersApplied: filters
        });
    } catch (error) {
        console.log('Error in applyAdvancedFilters:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const clearAdvancedFilters = async (req, res) => {
    try {
        await PremiumFeature.findOneAndUpdate(
            { userId: req.user.id, featureType: 'advanced_filters' },
            { $unset: { filters: '' } }
        );

        res.status(200).json({
            success: true,
            message: 'Advanced filters cleared'
        });
    } catch (error) {
        console.log('Error in clearAdvancedFilters:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const buildMatchQuery = (filters, currentUser) => {
    const query = {
        _id: { $ne: currentUser._id },
        gender: currentUser.genderPreference === 'all' ? 
            { $exists: true } : 
            currentUser.genderPreference,
        genderPreference: { $in: [currentUser.gender, 'all'] },
        age: {
            $gte: currentUser.ageRange?.min || 18,
            $lte: currentUser.ageRange?.max || 99
        }
    };

    // Education filter
    if (filters.education && filters.education.length > 0) {
        query['questionnaire.education'] = { $in: filters.education };
    }

    // Occupation filter
    if (filters.occupation && filters.occupation.length > 0) {
        query['questionnaire.occupation'] = { $in: filters.occupation };
    }

    // Height filter
    if (filters.height) {
        if (filters.height.min) {
            query['questionnaire.height'] = { $gte: filters.height.min };
        }
        if (filters.height.max) {
            query['questionnaire.height'] = { 
                ...query['questionnaire.height'], 
                $lte: filters.height.max 
            };
        }
    }

    // Interests filter
    if (filters.interests && filters.interests.length > 0) {
        query['questionnaire.interests'] = { $in: filters.interests };
    }

    // Lifestyle filters
    if (filters.lifestyle) {
        Object.entries(filters.lifestyle).forEach(([key, values]) => {
            if (values && values.length > 0) {
                query[`questionnaire.${key}`] = { $in: values };
            }
        });
    }

    // Personality filters
    if (filters.personality) {
        Object.entries(filters.personality).forEach(([key, values]) => {
            if (values && values.length > 0) {
                query[`questionnaire.${key}`] = { $in: values };
            }
        });
    }

    // Age preference compatibility
    if (filters.ageRange) {
        query.age = {
            $gte: filters.ageRange.min || 18,
            $lte: filters.ageRange.max || 99
        };
    }

    // Credibility score filter
    if (filters.minCredibilityScore) {
        query.credibilityScore = { $gte: filters.minCredibilityScore };
    }

    // Behavior index filter
    if (filters.minBehaviorIndex) {
        query.behaviorIndex = { $gte: filters.minBehaviorIndex };
    }

    // Location filter (if distance specified)
    if (filters.maxDistance && currentUser.location && currentUser.location.coordinates) {
        query.location = {
            $near: {
                $geometry: currentUser.location,
                $maxDistance: filters.maxDistance * 1609.34 // Convert miles to meters
            }
        };
    }

    // Last active filter
    if (filters.lastActiveWithin) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - filters.lastActiveWithin);
        query.lastActive = { $gte: daysAgo };
    }

    // Photo verified filter
    if (filters.photoVerifiedOnly) {
        query.isPhotoVerified = true;
    }

    // Verified profiles only
    if (filters.verifiedOnly) {
        query.isVerified = true;
    }

    return query;
};