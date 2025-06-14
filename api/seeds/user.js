// api/seeds/user.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const samplePrompts = [
    { prompt: "A shower thought I recently had...", answer: "That the brain named itself." },
    { prompt: "I get way too competitive about...", answer: "Board games. Especially Catan." },
    { prompt: "My most controversial opinion is...", answer: "Pineapple absolutely belongs on pizza." },
    { prompt: "I'm looking for...", answer: "Someone to explore new restaurants with and who doesn't take themselves too seriously." },
    { prompt: "Two truths and a lie...", answer: "I've been to 15 countries. I can speak 3 languages. I have a pet snake." },
];

const maleNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas"];
const femaleNames = ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah"];
const genderPreferences = ["male", "female", "both"];

const generateRandomUser = (gender, index) => {
	const names = gender === "male" ? maleNames : femaleNames;
	const name = names[index % names.length];
	const age = Math.floor(Math.random() * (45 - 21 + 1) + 21);

	// Create an array of 6 image URLs
	const images = Array.from({ length: 6 }, (_, i) => `/${gender}/${i + 1}.jpg`);

	// Select 3 random prompts
	const prompts = [...samplePrompts].sort(() => 0.5 - Math.random()).slice(0, 3);

	return {
		name,
		email: `${name.toLowerCase()}${age}@example.com`,
		password: "password123", // The pre-save hook will hash this
		age,
		gender,
		genderPreference: genderPreferences[Math.floor(Math.random() * genderPreferences.length)],
		images,
		prompts,
        job: "Professional Fun-haver",
        school: "School of Life",
        reputationScore: Math.floor(Math.random() * (95 - 75 + 1) + 75), // Random score between 75-95
	};
};

const seedUsers = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("MongoDB Connected for seeding...");

		console.log("Deleting old users...");
		await User.deleteMany({});
        // You might want to delete old likes too if they exist
        // await Like.deleteMany({});

		console.log("Generating new users...");
		const maleUsers = Array.from({ length: maleNames.length }, (_, i) => generateRandomUser("male", i));
		const femaleUsers = Array.from({ length: femaleNames.length }, (_, i) => generateRandomUser("female", i));

		const allUsers = [...maleUsers, ...femaleUsers];

		console.log("Inserting new users...");
		await User.insertMany(allUsers);

		console.log("Database seeded successfully with Hinge-style users!");
	} catch (error) {
		console.error("Error seeding database:", error);
	} finally {
		await mongoose.disconnect();
		console.log("MongoDB disconnected.");
	}
};

seedUsers();