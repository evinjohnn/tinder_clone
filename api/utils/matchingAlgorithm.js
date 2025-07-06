// api/utils/matchingAlgorithm.js
import User from '../models/User.js';
import Like from '../models/Like.js';

export class AdvancedMatchingAlgorithm {
    constructor() {
        this.weights = {
            compatibility: 0.35,
            proximity: 0.25,
            activity: 0.20,
            credibility: 0.15,
            preferences: 0.05
        };
    }

    async calculateMatchScore(currentUser, potentialMatch) {
        try {
            const compatibilityScore = this.calculateCompatibilityScore(currentUser, potentialMatch);
            const proximityScore = this.calculateProximityScore(currentUser, potentialMatch);
            const activityScore = this.calculateActivityScore(potentialMatch);
            const credibilityScore = this.normalizeScore(potentialMatch.credibilityScore);
            const preferencesScore = this.calculatePreferencesScore(currentUser, potentialMatch);

            const totalScore = (
                (compatibilityScore * this.weights.compatibility) +
                (proximityScore * this.weights.proximity) +
                (activityScore * this.weights.activity) +
                (credibilityScore * this.weights.credibility) +
                (preferencesScore * this.weights.preferences)
            );

            return Math.round(totalScore);
        } catch (error) {
            console.error('Error calculating match score:', error);
            return 50; // Default score
        }
    }

    calculateCompatibilityScore(user1, user2) {
        let score = 0;
        const maxScore = 100;
        
        // Interest compatibility (40% of compatibility score)
        const interestScore = this.calculateInterestCompatibility(user1, user2);
        score += interestScore * 0.4;
        
        // Lifestyle compatibility (30% of compatibility score)
        const lifestyleScore = this.calculateLifestyleCompatibility(user1, user2);
        score += lifestyleScore * 0.3;
        
        // Values compatibility (30% of compatibility score)
        const valuesScore = this.calculateValuesCompatibility(user1, user2);
        score += valuesScore * 0.3;
        
        return Math.min(score, maxScore);
    }

    calculateInterestCompatibility(user1, user2) {
        const interests1 = user1.questionnaire?.interests || [];
        const interests2 = user2.questionnaire?.interests || [];
        
        if (interests1.length === 0 || interests2.length === 0) return 50;
        
        const commonInterests = interests1.filter(interest => 
            interests2.includes(interest)
        ).length;
        
        const totalInterests = new Set([...interests1, ...interests2]).size;
        
        return totalInterests > 0 ? (commonInterests / totalInterests) * 100 : 50;
    }

    calculateLifestyleCompatibility(user1, user2) {
        const lifestyle1 = user1.questionnaire || {};
        const lifestyle2 = user2.questionnaire || {};
        
        let compatibilityPoints = 0;
        let totalChecks = 0;
        
        // Check key lifestyle factors
        const lifestyleFactors = [
            'fitnessLevel',
            'socialLevel',
            'drinkingHabits',
            'smokingHabits',
            'diet',
            'relationshipGoals'
        ];
        
        lifestyleFactors.forEach(factor => {
            if (lifestyle1[factor] && lifestyle2[factor]) {
                totalChecks++;
                if (lifestyle1[factor] === lifestyle2[factor]) {
                    compatibilityPoints += 2;
                } else if (this.isCompatibleLifestyle(factor, lifestyle1[factor], lifestyle2[factor])) {
                    compatibilityPoints += 1;
                }
            }
        });
        
        return totalChecks > 0 ? (compatibilityPoints / (totalChecks * 2)) * 100 : 50;
    }

    calculateValuesCompatibility(user1, user2) {
        const values1 = user1.questionnaire || {};
        const values2 = user2.questionnaire || {};
        
        let compatibilityPoints = 0;
        let totalChecks = 0;
        
        // Check important values
        const valueFactors = [
            'politicalViews',
            'religiousViews',
            'relationshipGoals',
            'wantsChildren'
        ];
        
        valueFactors.forEach(factor => {
            if (values1[factor] && values2[factor]) {
                totalChecks++;
                if (values1[factor] === values2[factor]) {
                    compatibilityPoints += 2;
                } else if (this.isCompatibleValue(factor, values1[factor], values2[factor])) {
                    compatibilityPoints += 1;
                }
            }
        });
        
        return totalChecks > 0 ? (compatibilityPoints / (totalChecks * 2)) * 100 : 50;
    }

    calculateProximityScore(user1, user2) {
        if (!user1.location?.coordinates || !user2.location?.coordinates) {
            return 50; // Default score if location not available
        }
        
        const distance = this.calculateDistance(
            user1.location.coordinates[1], // latitude
            user1.location.coordinates[0], // longitude
            user2.location.coordinates[1],
            user2.location.coordinates[0]
        );
        
        const maxDistance = user1.maxDistance || 50;
        
        if (distance > maxDistance) return 0;
        
        // Score decreases with distance
        return Math.max(0, 100 - (distance / maxDistance) * 100);
    }

    calculateActivityScore(user) {
        const now = new Date();
        const lastActive = new Date(user.lastActive);
        const hoursSinceActive = (now - lastActive) / (1000 * 60 * 60);
        
        // Score based on recent activity
        if (hoursSinceActive < 1) return 100;
        if (hoursSinceActive < 24) return 80;
        if (hoursSinceActive < 168) return 60; // 1 week
        if (hoursSinceActive < 720) return 40; // 1 month
        return 20;
    }

    calculatePreferencesScore(user1, user2) {
        let score = 100;
        
        // Age preference
        if (user1.ageRange) {
            if (user2.age < user1.ageRange.min || user2.age > user1.ageRange.max) {
                score -= 30;
            }
        }
        
        // Gender preference
        if (user1.genderPreference !== 'all' && user1.genderPreference !== user2.gender) {
            score -= 50;
        }
        
        return Math.max(0, score);
    }

    normalizeScore(score) {
        return Math.min(100, Math.max(0, score));
    }

    isCompatibleLifestyle(factor, value1, value2) {
        const compatibilityMap = {
            fitnessLevel: {
                'never': ['rarely'],
                'rarely': ['never', 'sometimes'],
                'sometimes': ['rarely', 'often'],
                'often': ['sometimes', 'daily'],
                'daily': ['often']
            },
            socialLevel: {
                'homebody': ['sometimes'],
                'sometimes': ['homebody', 'social'],
                'social': ['sometimes', 'very_social'],
                'very_social': ['social']
            },
            drinkingHabits: {
                'never': ['rarely'],
                'rarely': ['never', 'socially'],
                'socially': ['rarely', 'regularly'],
                'regularly': ['socially']
            }
        };
        
        return compatibilityMap[factor]?.[value1]?.includes(value2) || false;
    }

    isCompatibleValue(factor, value1, value2) {
        const compatibilityMap = {
            politicalViews: {
                'liberal': ['moderate'],
                'moderate': ['liberal', 'conservative'],
                'conservative': ['moderate']
            },
            wantsChildren: {
                'yes': ['maybe'],
                'maybe': ['yes', 'no'],
                'no': ['maybe']
            }
        };
        
        return compatibilityMap[factor]?.[value1]?.includes(value2) || false;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3959; // Earth's radius in miles
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    async getDiscoveryFeed(userId, limit = 20) {
        try {
            const currentUser = await User.findById(userId);
            if (!currentUser) return [];

            // Get users already interacted with
            const sentLikes = await Like.find({ sender: userId }).select('receiver');
            const likedUserIds = sentLikes.map(like => like.receiver.toString());

            // Build base query
            const baseQuery = {
                _id: { $ne: userId },
                _id: { $nin: [...currentUser.matches, ...likedUserIds, ...currentUser.blockedUsers] },
                gender: currentUser.genderPreference === 'all' ? 
                    { $in: ['male', 'female', 'non-binary', 'other'] } : 
                    currentUser.genderPreference,
                genderPreference: { $in: [currentUser.gender, 'all'] }
            };

            // Add age filter
            if (currentUser.ageRange) {
                baseQuery.age = {
                    $gte: currentUser.ageRange.min,
                    $lte: currentUser.ageRange.max
                };
            }

            // Get potential matches
            const potentialMatches = await User.find(baseQuery)
                .limit(limit * 2) // Get more to score and filter
                .lean();

            // Calculate match scores
            const scoredMatches = await Promise.all(
                potentialMatches.map(async (match) => {
                    const score = await this.calculateMatchScore(currentUser, match);
                    return { ...match, matchScore: score };
                })
            );

            // Sort by score and add diversity
            const sortedMatches = scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
            const diverseMatches = this.addDiversityToResults(sortedMatches, 0.2);

            return diverseMatches.slice(0, limit);
        } catch (error) {
            console.error('Error getting discovery feed:', error);
            return [];
        }
    }

    addDiversityToResults(matches, diversityRatio) {
        const totalCount = matches.length;
        const diversityCount = Math.floor(totalCount * diversityRatio);
        const topMatches = matches.slice(0, totalCount - diversityCount);
        
        // Add some random matches for diversity
        const remainingMatches = matches.slice(totalCount - diversityCount);
        const diverseMatches = remainingMatches
            .sort(() => 0.5 - Math.random())
            .slice(0, diversityCount);
        
        return [...topMatches, ...diverseMatches].sort(() => 0.5 - Math.random());
    }

    async getStandouts(userId, limit = 10) {
        try {
            const currentUser = await User.findById(userId);
            if (!currentUser) return [];

            const sentLikes = await Like.find({ sender: userId }).select('receiver');
            const likedUserIds = sentLikes.map(like => like.receiver.toString());

            const query = {
                _id: { $ne: userId },
                _id: { $nin: [...currentUser.matches, ...likedUserIds, ...currentUser.blockedUsers] },
                gender: currentUser.genderPreference === 'all' ? 
                    { $in: ['male', 'female', 'non-binary', 'other'] } : 
                    currentUser.genderPreference,
                genderPreference: { $in: [currentUser.gender, 'all'] },
                credibilityScore: { $gte: 85 },
                behaviorIndex: { $gte: 80 },
                isPremium: true
            };

            const standouts = await User.find(query)
                .sort({ credibilityScore: -1, behaviorIndex: -1, lastActive: -1 })
                .limit(limit)
                .lean();

            return standouts;
        } catch (error) {
            console.error('Error getting standouts:', error);
            return [];
        }
    }
}

export const matchingAlgorithm = new AdvancedMatchingAlgorithm();