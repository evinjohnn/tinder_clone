// api/controllers/premiumController.js
import User from "../models/User.js";
import PremiumFeature from "../models/PremiumFeature.js";

export const getPremiumStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        const premiumStatus = {
            isPremium: user.isPremium,
            premiumExpiry: user.premiumExpiry,
            superLikesDaily: user.superLikesDaily,
            superLikesUsed: user.superLikesUsed,
            boostCredits: user.boostCredits,
            roses: user.roses,
            features: {
                superLikes: user.isPremium,
                boosts: user.isPremium,
                advancedFilters: user.isPremium,
                incognitoMode: user.isPremium,
                readReceipts: user.isPremium,
                rewind: user.isPremium,
                passport: user.isPremium
            }
        };

        res.status(200).json({
            success: true,
            premiumStatus
        });
    } catch (error) {
        console.log("Error in getPremiumStatus:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const purchasePremium = async (req, res) => {
    try {
        const { plan, duration } = req.body; // plan: 'monthly', 'yearly', etc.
        
        // In a real app, you would integrate with payment processor here
        // For demo purposes, we'll just simulate the purchase
        
        const user = await User.findById(req.user.id);
        
        let premiumDuration = 30; // days
        let superLikesDaily = 5;
        let boostCredits = 1;
        let roses = 1;
        
        if (plan === 'yearly') {
            premiumDuration = 365;
            superLikesDaily = 10;
            boostCredits = 5;
            roses = 10;
        } else if (plan === 'weekly') {
            premiumDuration = 7;
            superLikesDaily = 3;
            boostCredits = 0;
            roses = 0;
        }

        const premiumExpiry = new Date();
        premiumExpiry.setDate(premiumExpiry.getDate() + premiumDuration);

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                isPremium: true,
                premiumExpiry,
                superLikesDaily,
                superLikesUsed: 0,
                boostCredits: user.boostCredits + boostCredits,
                roses: user.roses + roses
            },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            user: updatedUser,
            message: `Premium ${plan} plan activated successfully!`
        });
    } catch (error) {
        console.log("Error in purchasePremium:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const useAdvancedFilters = async (req, res) => {
    try {
        const { filters } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user.isPremium) {
            return res.status(403).json({ 
                success: false, 
                message: "Premium feature - Upgrade to use advanced filters" 
            });
        }

        // Save or update advanced filters
        await PremiumFeature.findOneAndUpdate(
            { userId: req.user.id, featureType: 'advanced_filters' },
            {
                filters,
                lastUsed: new Date(),
                usageCount: { $inc: 1 }
            },
            { upsert: true }
        );

        res.status(200).json({
            success: true,
            message: "Advanced filters applied successfully"
        });
    } catch (error) {
        console.log("Error in useAdvancedFilters:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const activateIncognitoMode = async (req, res) => {
    try {
        const { duration } = req.body; // in hours
        
        const user = await User.findById(req.user.id);
        
        if (!user.isPremium) {
            return res.status(403).json({ 
                success: false, 
                message: "Premium feature - Upgrade to use incognito mode" 
            });
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + (duration || 24));

        // Create or update incognito feature
        await PremiumFeature.findOneAndUpdate(
            { userId: req.user.id, featureType: 'incognito' },
            {
                isActive: true,
                expiresAt,
                lastUsed: new Date()
            },
            { upsert: true }
        );

        // Update user's incognito mode
        await User.findByIdAndUpdate(req.user.id, {
            incognitoMode: true
        });

        res.status(200).json({
            success: true,
            message: "Incognito mode activated successfully",
            expiresAt
        });
    } catch (error) {
        console.log("Error in activateIncognitoMode:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deactivateIncognitoMode = async (req, res) => {
    try {
        await PremiumFeature.findOneAndUpdate(
            { userId: req.user.id, featureType: 'incognito' },
            { isActive: false }
        );

        await User.findByIdAndUpdate(req.user.id, {
            incognitoMode: false
        });

        res.status(200).json({
            success: true,
            message: "Incognito mode deactivated successfully"
        });
    } catch (error) {
        console.log("Error in deactivateIncognitoMode:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const usePassport = async (req, res) => {
    try {
        const { location } = req.body; // { city, country, coordinates }
        
        const user = await User.findById(req.user.id);
        
        if (!user.isPremium) {
            return res.status(403).json({ 
                success: false, 
                message: "Premium feature - Upgrade to use passport" 
            });
        }

        // Create or update passport feature
        await PremiumFeature.findOneAndUpdate(
            { userId: req.user.id, featureType: 'passport' },
            {
                passportLocation: location,
                isActive: true,
                lastUsed: new Date()
            },
            { upsert: true }
        );

        res.status(200).json({
            success: true,
            message: `Passport activated for ${location.city}, ${location.country}`,
            location
        });
    } catch (error) {
        console.log("Error in usePassport:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const resetDailyLimits = async (req, res) => {
    try {
        // This would typically be run as a cron job
        await User.updateMany(
            {},
            {
                $set: {
                    superLikesUsed: 0
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "Daily limits reset successfully"
        });
    } catch (error) {
        console.log("Error in resetDailyLimits:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getFeatureUsage = async (req, res) => {
    try {
        const features = await PremiumFeature.find({ userId: req.user.id })
            .sort({ lastUsed: -1 });

        res.status(200).json({
            success: true,
            features
        });
    } catch (error) {
        console.log("Error in getFeatureUsage:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};