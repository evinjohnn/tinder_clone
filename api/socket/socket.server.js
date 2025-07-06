// api/socket/socket.server.js
import { Server } from "socket.io";
import Message from "../models/Message.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

let io;
const connectedUsers = new Map(); // userId -> socketId

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    // Socket authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("No token provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password");
            
            if (!user) {
                return next(new Error("User not found"));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error("Authentication failed"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User ${socket.user.name} connected with socket ID: ${socket.id}`);
        
        // Store user connection
        connectedUsers.set(socket.user._id.toString(), socket.id);

        // Update user online status
        User.findByIdAndUpdate(socket.user._id, { 
            onlineStatus: 'online',
            lastActive: new Date()
        }).exec();

        // Join user to their personal room
        socket.join(socket.user._id.toString());

        // Handle sending messages
        socket.on("sendMessage", async (data) => {
            try {
                const { receiverId, content } = data;
                
                // Validate receiver exists and is a match
                const receiver = await User.findById(receiverId);
                const sender = await User.findById(socket.user._id);
                
                if (!receiver || !sender.matches.includes(receiverId)) {
                    socket.emit("error", { message: "Cannot send message to this user" });
                    return;
                }

                // Create message
                const newMessage = new Message({
                    sender: socket.user._id,
                    receiver: receiverId,
                    content: content.trim()
                });

                await newMessage.save();

                // Populate sender info
                await newMessage.populate('sender', 'name images');

                // Update behavior metrics
                await User.findByIdAndUpdate(socket.user._id, {
                    $inc: { 
                        'behaviorMetrics.positiveInteractions': 1,
                        'behaviorMetrics.conversationLength': 1
                    }
                });

                // Send to receiver if online
                const receiverSocketId = connectedUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newMessage", newMessage);
                    
                    // Send typing stopped event
                    io.to(receiverSocketId).emit("typingStopped", { 
                        senderId: socket.user._id.toString() 
                    });
                }

                // Confirm to sender
                socket.emit("messageDelivered", { 
                    messageId: newMessage._id,
                    timestamp: newMessage.createdAt
                });

            } catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Handle typing indicators
        socket.on("typing", (data) => {
            const { receiverId } = data;
            const receiverSocketId = connectedUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing", { 
                    senderId: socket.user._id.toString(),
                    senderName: socket.user.name
                });
            }
        });

        socket.on("stopTyping", (data) => {
            const { receiverId } = data;
            const receiverSocketId = connectedUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typingStopped", { 
                    senderId: socket.user._id.toString() 
                });
            }
        });

        // Handle message read receipts
        socket.on("markAsRead", async (data) => {
            try {
                const { messageId, senderId } = data;
                
                // Update message as read (you might want to add a read field to Message model)
                // For now, just notify the sender
                const senderSocketId = connectedUsers.get(senderId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit("messageRead", { 
                        messageId,
                        readBy: socket.user._id.toString(),
                        readAt: new Date()
                    });
                }
            } catch (error) {
                console.error("Error marking message as read:", error);
            }
        });

        // Handle video call initiation
        socket.on("initiateCall", (data) => {
            const { receiverId, callType } = data; // callType: 'voice' or 'video'
            const receiverSocketId = connectedUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("incomingCall", {
                    callerId: socket.user._id.toString(),
                    callerName: socket.user.name,
                    callerImage: socket.user.images[0],
                    callType
                });
            }
        });

        // Handle call responses
        socket.on("callResponse", (data) => {
            const { callerId, response } = data; // response: 'accept' or 'decline'
            const callerSocketId = connectedUsers.get(callerId);
            
            if (callerSocketId) {
                io.to(callerSocketId).emit("callResponse", {
                    response,
                    responderId: socket.user._id.toString()
                });
            }
        });

        // Handle match notifications
        socket.on("newMatch", (data) => {
            const { matchId } = data;
            const matchSocketId = connectedUsers.get(matchId);
            
            if (matchSocketId) {
                io.to(matchSocketId).emit("newMatch", {
                    _id: socket.user._id,
                    name: socket.user.name,
                    image: socket.user.images[0]
                });
            }
        });

        // Handle online status updates
        socket.on("updateStatus", async (data) => {
            const { status } = data; // 'online', 'away', 'offline'
            
            try {
                await User.findByIdAndUpdate(socket.user._id, { 
                    onlineStatus: status,
                    lastActive: new Date()
                });

                // Notify matches about status change
                const user = await User.findById(socket.user._id).populate('matches', '_id');
                user.matches.forEach(match => {
                    const matchSocketId = connectedUsers.get(match._id.toString());
                    if (matchSocketId) {
                        io.to(matchSocketId).emit("statusUpdate", {
                            userId: socket.user._id.toString(),
                            status
                        });
                    }
                });
            } catch (error) {
                console.error("Error updating status:", error);
            }
        });

        // Handle location updates for nearby matching
        socket.on("updateLocation", async (data) => {
            const { latitude, longitude } = data;
            
            try {
                await User.findByIdAndUpdate(socket.user._id, {
                    location: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    }
                });
            } catch (error) {
                console.error("Error updating location:", error);
            }
        });

        // Handle user going away (but not disconnecting)
        socket.on("userAway", async () => {
            try {
                await User.findByIdAndUpdate(socket.user._id, { 
                    onlineStatus: 'away',
                    lastActive: new Date()
                });
            } catch (error) {
                console.error("Error setting user away:", error);
            }
        });

        // Handle user coming back
        socket.on("userBack", async () => {
            try {
                await User.findByIdAndUpdate(socket.user._id, { 
                    onlineStatus: 'online',
                    lastActive: new Date()
                });
            } catch (error) {
                console.error("Error setting user back:", error);
            }
        });

        // Handle disconnection
        socket.on("disconnect", async () => {
            console.log(`User ${socket.user.name} disconnected`);
            
            // Remove user from connected users
            connectedUsers.delete(socket.user._id.toString());
            
            // Update user status to offline
            try {
                await User.findByIdAndUpdate(socket.user._id, { 
                    onlineStatus: 'offline',
                    lastActive: new Date()
                });

                // Notify matches about offline status
                const user = await User.findById(socket.user._id).populate('matches', '_id');
                if (user && user.matches) {
                    user.matches.forEach(match => {
                        const matchSocketId = connectedUsers.get(match._id.toString());
                        if (matchSocketId) {
                            io.to(matchSocketId).emit("statusUpdate", {
                                userId: socket.user._id.toString(),
                                status: 'offline'
                            });
                        }
                    });
                }
            } catch (error) {
                console.error("Error updating user status on disconnect:", error);
            }
        });
    });

    return io;
};

export const getConnectedUsers = () => connectedUsers;
export const getIO = () => io;