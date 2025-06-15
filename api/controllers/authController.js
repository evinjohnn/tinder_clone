// api/controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcryptjs";

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const signup = async (req, res) => {
	try {
		const { name, email, password, age, gender, genderPreference } = req.body;
		if (!name || !email || !password || !age || !gender || !genderPreference) {
			return res.status(400).json({ success: false, message: "All fields are required" });
		}
        // ... other validations
        if (age < 18) return res.status(400).json({ success: false, message: "You must be at least 18 years old" });
        if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: "Invalid email format" });

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ success: false, message: "Email is already in use." });
		}

		// FIX: Pass the plain password directly to User.create().
		// The pre-save hook in the User model will now handle the hashing.
		// This corrects the double-hashing bug that prevented re-login.
		const newUser = await User.create({
			name,
			email,
			password, // Hashing is now done by the model's pre-save hook.
			age,
			gender,
			genderPreference,
			images: [],
			prompts: [],
		});

		const token = signToken(newUser._id);
		res.cookie("jwt", token, {
			maxAge: 7 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		});
		
		const userToReturn = newUser.toObject();
        delete userToReturn.password;

		res.status(201).json({ success: true, user: userToReturn });
	} catch (error) {
		console.log("Error in signup controller:", error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ success: false, message: "Email and password are required" });
		}
		const user = await User.findOne({ email }).select("+password");
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({ success: false, message: "Invalid email or password" });
		}
        
        user.lastActive = new Date();
        await user.save({ validateBeforeSave: false });

		const token = signToken(user._id);
		res.cookie("jwt", token, {
			maxAge: 7 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		});
        
        const userToReturn = user.toObject();
        delete userToReturn.password;

		res.status(200).json({ success: true, user: userToReturn });
	} catch (error) {
		console.log("Error in login controller:", error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};

export const logout = async (req, res) => {
	res.clearCookie("jwt");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};