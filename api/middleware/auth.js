// api/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authorized - No token provided" 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authorized - Invalid token" 
            });
        }

        const currentUser = await User.findById(decoded.id).select("-password");
        
        if (!currentUser) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authorized - User not found" 
            });
        }

        // Check if account is locked
        if (currentUser.isLocked) {
            return res.status(423).json({ 
                success: false, 
                message: "Account temporarily locked" 
            });
        }

        // Check if premium has expired
        if (currentUser.isPremium && currentUser.premiumExpiry && new Date() > currentUser.premiumExpiry) {
            await User.findByIdAndUpdate(decoded.id, { 
                isPremium: false,
                superLikesDaily: 1,
                boostCredits: 0
            });
            currentUser.isPremium = false;
        }

        req.user = currentUser;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: "Not authorized - Token expired" 
            });
        }
        
        console.log("Error in auth middleware:", error);
        return res.status(401).json({ 
            success: false, 
            message: "Not authorized - Invalid token" 
        });
    }
};

export const requirePremium = async (req, res, next) => {
    try {
        if (!req.user.isPremium) {
            return res.status(403).json({ 
                success: false, 
                message: "Premium subscription required" 
            });
        }
        next();
    } catch (error) {
        console.log("Error in premium middleware:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

export const requireVerification = async (req, res, next) => {
    try {
        if (!req.user.isVerified) {
            return res.status(403).json({ 
                success: false, 
                message: "Account verification required" 
            });
        }
        next();
    } catch (error) {
        console.log("Error in verification middleware:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

export const updateLastActive = async (req, res, next) => {
    try {
        if (req.user && req.user.id) {
            await User.findByIdAndUpdate(req.user.id, { 
                lastActive: new Date() 
            });
        }
        next();
    } catch (error) {
        // Don't block the request if this fails
        console.log("Error updating last active:", error);
        next();
    }
};