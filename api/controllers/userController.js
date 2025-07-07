// api/controllers/userController.js
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import sharp from "sharp";

export const updateProfile = async (req, res) => {
    try {
        const { name, age, job, school, prompts, images, questionnaire, location } = req.body;
        
        // Prepare the data to be updated
        let updatedData = { name, age, job, school, prompts };

        // Handle questionnaire update
        if (questionnaire) {
            const user = await User.findById(req.user.id);
            updatedData.questionnaire = { ...user.questionnaire, ...questionnaire };
        }

        // Handle location update
        if (location && location.coordinates) {
            updatedData.location = {
                type: 'Point',
                coordinates: [location.coordinates[1], location.coordinates[0]] // [longitude, latitude]
            };
        }

        // Handle images array with enhanced validation (3-6 photos)
        if (images && Array.isArray(images)) {
            // Validate photo count (3-6 photos required)
            if (images.length < 3) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Minimum 3 photos required for profile completion" 
                });
            }
            
            if (images.length > 6) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Maximum 6 photos allowed" 
                });
            }

            const uploadedImageUrls = await Promise.all(
                images.map(async (image) => {
                    // If it's a new base64 image string, upload it to Cloudinary
                    if (image && image.startsWith("data:image")) {
                        try {
                            // Validate image format and size
                            const imageValidation = await validateImage(image);
                            if (!imageValidation.valid) {
                                throw new Error(imageValidation.error);
                            }

                            // Optimize image before upload
                            const optimizedImage = await optimizeImage(image);
                            
                            const uploadResponse = await cloudinary.uploader.upload(optimizedImage, {
                                folder: "datex_profiles",
                                format: "webp",
                                quality: "auto:good",
                                transformation: [
                                    { width: 800, height: 800, crop: "limit" },
                                    { quality: "auto:good" },
                                    { format: "webp" }
                                ]
                            });
                            return uploadResponse.secure_url;
                        } catch (uploadError) {
                            console.error("Cloudinary upload error:", uploadError);
                            return null;
                        }
                    }
                    // If it's an existing URL, keep it
                    return image;
                })
            );

            // Filter out failed uploads
            const validImages = uploadedImageUrls.filter(url => url !== null);
            
            // Ensure we still have minimum required photos after processing
            if (validImages.length < 3) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Failed to process enough photos. Please ensure all photos are valid and try again." 
                });
            }
            
            updatedData.images = validImages;
        }

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Update scores after profile update
        updatedUser.updateCredibilityScore();
        updatedUser.updateBehaviorIndex();
        await updatedUser.save();

        res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile updated successfully"
        });
    } catch (error) {
        console.log("Error in updateProfile: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const uploadPhotoVerification = async (req, res) => {
    try {
        const { verificationPhoto } = req.body;
        
        if (!verificationPhoto || !verificationPhoto.startsWith("data:image")) {
            return res.status(400).json({ success: false, message: "Valid verification photo required" });
        }

        // Upload verification photo
        const uploadResponse = await cloudinary.uploader.upload(verificationPhoto, {
            folder: "datex_verification",
            format: "webp",
            quality: "auto:good",
            transformation: [
                { width: 600, height: 600, crop: "limit" },
                { quality: "auto:good" },
                { format: "webp" }
            ]
        });

        // Add to user's verification photos
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { 
                $push: { verificationPhotos: uploadResponse.secure_url },
                isPhotoVerified: true
            },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            user,
            message: "Photo verification submitted successfully"
        });
    } catch (error) {
        console.log("Error in upload photo verification:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updatePrivacySettings = async (req, res) => {
    try {
        const { 
            incognitoMode, 
            showReadReceipts, 
            showOnlineStatus, 
            pushNotifications, 
            emailNotifications 
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                incognitoMode,
                showReadReceipts,
                showOnlineStatus,
                pushNotifications,
                emailNotifications
            },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Privacy settings updated successfully"
        });
    } catch (error) {
        console.log("Error in update privacy settings:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updatePreferences = async (req, res) => {
    try {
        const { ageRange, maxDistance, genderPreference } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                ageRange,
                maxDistance,
                genderPreference
            },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Preferences updated successfully"
        });
    } catch (error) {
        console.log("Error in update preferences:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { blockedUsers: userId } },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            user,
            message: "User blocked successfully"
        });
    } catch (error) {
        console.log("Error in block user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { blockedUsers: userId } },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            user,
            message: "User unblocked successfully"
        });
    } catch (error) {
        console.log("Error in unblock user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const reportUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason, description } = req.body;

        // Create report (assuming you have a Report model)
        const Report = (await import('../models/Report.js')).default;
        
        const report = new Report({
            reporter: req.user.id,
            reported: userId,
            reason,
            description
        });

        await report.save();

        // Update behavior metrics for reported user
        await User.findByIdAndUpdate(userId, {
            $inc: { 'behaviorMetrics.reportCount': 1 }
        });

        res.status(200).json({
            success: true,
            message: "Report submitted successfully"
        });
    } catch (error) {
        console.log("Error in report user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId)
            .select('-password -email -loginAttempts -lockUntil -blockedUsers')
            .populate('matches', 'name images');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Increment profile views
        await User.findByIdAndUpdate(userId, {
            $inc: { 'behaviorMetrics.profileViews': 1 }
        });

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.log("Error in get user profile:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        
        // Verify password before deletion
        const user = await User.findById(req.user.id).select('+password');
        const isPasswordValid = await user.matchPassword(password);
        
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid password" });
        }

        // Delete user's images from Cloudinary
        if (user.images && user.images.length > 0) {
            for (const imageUrl of user.images) {
                try {
                    const publicId = imageUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`datex_profiles/${publicId}`);
                } catch (error) {
                    console.log("Error deleting image:", error);
                }
            }
        }

        // Delete user account
        await User.findByIdAndDelete(req.user.id);

        // Clear cookies
        res.clearCookie("jwt");
        res.clearCookie("refreshToken");

        res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.log("Error in delete account:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Helper function to optimize images
async function optimizeImage(base64Image) {
    try {
        // Remove data URL prefix
        const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Optimize with Sharp
        const optimizedBuffer = await sharp(buffer)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
        
        // Convert back to base64
        const optimizedBase64 = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;
        return optimizedBase64;
    } catch (error) {
        console.error('Error optimizing image:', error);
        return base64Image; // Return original if optimization fails
    }
}

// Helper function to validate images (3-6 photos with format validation)
async function validateImage(base64Image) {
    try {
        // Check if it's a valid base64 image
        if (!base64Image.startsWith('data:image/')) {
            return { valid: false, error: 'Invalid image format' };
        }

        // Extract image type
        const imageType = base64Image.split(';')[0].split('/')[1];
        const allowedTypes = ['jpeg', 'jpg', 'png', 'webp'];
        
        if (!allowedTypes.includes(imageType.toLowerCase())) {
            return { valid: false, error: 'Unsupported image format. Please use JPEG, PNG, or WebP' };
        }

        // Check file size (max 10MB)
        const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const sizeInMB = buffer.length / (1024 * 1024);
        
        if (sizeInMB > 10) {
            return { valid: false, error: 'Image size too large. Maximum 10MB allowed' };
        }

        // Validate image dimensions and content using Sharp
        const metadata = await sharp(buffer).metadata();
        
        if (metadata.width < 200 || metadata.height < 200) {
            return { valid: false, error: 'Image too small. Minimum 200x200 pixels required' };
        }

        return { valid: true };
    } catch (error) {
        console.error('Error validating image:', error);
        return { valid: false, error: 'Invalid or corrupted image file' };
    }
}