// api/controllers/matchController.js
import User from "../models/User.js";
import Like from "../models/Like.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";

const getDiscoveryQuery = async (currentUser) => {
    const sentLikes = await Like.find({ sender: currentUser._id }).select("receiver");
    const likedUserIds = sentLikes.map(like => like.receiver);

    return {
        $and: [
            { _id: { $ne: currentUser.id } },
            { _id: { $nin: currentUser.matches } },
            { _id: { $nin: likedUserIds } },
            {
                gender:
                    currentUser.genderPreference === "both"
                        ? { $in: ["male", "female"] }
                        : currentUser.genderPreference,
            },
            { genderPreference: { $in: [currentUser.gender, "both"] } },
        ],
    };
};

export const getDiscoverFeed = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const query = await getDiscoveryQuery(currentUser);

        // Prioritize by reputation score
        const users = await User.find(query).sort({ reputationScore: -1 }).limit(20);

        res.status(200).json({ success: true, users });
    } catch (error) {
        console.log("Error in getDiscoverFeed: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getStandoutsFeed = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const query = await getDiscoveryQuery(currentUser);

        // Standouts are top-tier users, heavily weighted by reputation
        const standouts = await User.find({
            ...query,
            reputationScore: { $gte: 85 }
        }).sort({ reputationScore: -1, lastActive: -1 }).limit(10);
        
        res.status(200).json({ success: true, users: standouts });
    } catch (error) {
        console.log("Error in getStandoutsFeed: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const sendLike = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const { likedContent, comment, isRose } = req.body;
        const sender = await User.findById(req.user.id);

        if (isRose) {
            if (sender.roses < 1) {
                return res.status(400).json({ success: false, message: "Not enough roses." });
            }
            sender.roses -= 1;
        }

        const newLike = new Like({
            sender: sender._id,
            receiver: receiverId,
            likedContent,
            comment,
            isRose
        });
        
        await newLike.save();
        await sender.save();

        const mutualLike = await Like.findOne({ sender: receiverId, receiver: sender._id });

        if (mutualLike) {
            // It's a match logic...
            const receiver = await User.findById(receiverId);

            sender.matches.push(receiverId);
            receiver.matches.push(sender._id);
            await Promise.all([sender.save(), receiver.save()]);
            await Like.updateMany(
                { $or: [{ sender: sender._id, receiver: receiverId }, { sender: receiverId, receiver: sender._id }] },
                { status: 'matched' }
            );

            // Real-time notification
            const connectedUsers = getConnectedUsers();
            const io = getIO();

            const receiverSocketId = connectedUsers.get(receiverId.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMatch", {
                    _id: sender._id,
                    name: sender.name,
                    image: sender.images[0],
                });
            }
            
            return res.status(200).json({ success: true, matched: true, user: sender });
        }

        res.status(200).json({ success: true, matched: false, rosesLeft: sender.roses });
    } catch (error) {
        console.log("Error in sendLike: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ... (getIncomingLikes and getMatches remain largely the same, but populate more data)
export const getIncomingLikes = async (req, res) => {
    try {
        const likes = await Like.find({ receiver: req.user.id, status: 'pending' })
            .populate('sender', 'name age images prompts reputationScore');
        
        res.status(200).json({ success: true, likes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getMatches = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).populate("matches", "name images");
        const matchesWithFirstImage = user.matches.map(match => ({
            ...match.toObject(),
            image: match.images && match.images.length > 0 ? match.images[0] : null
        }));

		res.status(200).json({
			success: true,
			matches: matchesWithFirstImage,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};