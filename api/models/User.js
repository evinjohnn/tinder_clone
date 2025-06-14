// api/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const promptSchema = new mongoose.Schema({
    prompt: { type: String, required: true },
    answer: { type: String, required: true },
});

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: (value) => validator.isEmail(value),
                message: "Invalid email format",
            },
        },
        password: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        gender: {
            type: String,
            required: true,
            enum: ["male", "female"],
        },
        genderPreference: {
            type: String,
            required: true,
            enum: ["male", "female", "both"],
        },
        // MODIFIED: Replaced bio and added detailed profile fields
        job: { type: String, default: "" },
        school: { type: String, default: "" },
        images: [{ type: String }], // Array of 6 images
        prompts: [promptSchema],    // Array of 3 prompts
        matches: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        
        // NEW: Reputation and Advanced Feature Fields
        isVerified: { type: Boolean, default: false },
        reputationScore: { type: Number, default: 70 },
        lastActive: { type: Date, default: Date.now },
        roses: { type: Number, default: 5 }, // Starting roses
    },
    { timestamps: true }
);

// We keep this hook as it's good practice. We'll adjust the signup logic later.
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;