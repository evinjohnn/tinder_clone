// api/controllers/userController.js
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

export const updateProfile = async (req, res) => {
	try {
		const { name, age, job, school, prompts, images } = req.body;
		
        // Prepare the data to be updated, excluding images for now.
		let updatedData = { name, age, job, school, prompts };

		// FIX: Correctly handle an array of images.
		if (images && Array.isArray(images)) {
			const uploadedImageUrls = await Promise.all(
				images.map(async (image) => {
					// If it's a new base64 image string, upload it to Cloudinary.
					if (image && image.startsWith("data:image")) {
						try {
							const uploadResponse = await cloudinary.uploader.upload(image, {
								folder: "datex_profiles", // A dedicated folder in Cloudinary
								format: "webp",          // Convert to modern, efficient format
								quality: "auto:good",    // Optimize quality
                                transformation: [{ width: 800, height: 800, crop: "limit" }] // Resize images
							});
							return uploadResponse.secure_url;
						} catch (uploadError) {
							console.error("Cloudinary upload error:", uploadError);
							// Return null or an empty string for failed uploads
							return null; 
						}
					}
					// If it's an existing URL (not a base64 string), keep it.
					return image;
				})
			);

			// Filter out any failed uploads (which we marked as null)
			updatedData.images = uploadedImageUrls.filter(url => url !== null);
		}

		const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });

		if (!updatedUser) {
			return res.status(404).json({ success: false, message: "User not found." });
		}

		res.status(200).json({
			success: true,
			user: updatedUser,
		});
	} catch (error) {
		console.log("Error in updateProfile: ", error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};