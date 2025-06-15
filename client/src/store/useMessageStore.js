// client/src/store/useMessageStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../socket/socket.client";
import { useAuthStore } from "./useAuthStore";
import { v4 as uuidv4 } from "uuid"; // We'll need to install uuid: npm install uuid

export const useMessageStore = create((set, get) => ({
	messages: [],
	loading: true,

	sendMessage: async (receiverId, content) => {
		const tempId = uuidv4(); // Generate a temporary unique ID
		const authUser = useAuthStore.getState().authUser;

		// FIX: Proper optimistic update with a temporary message
		const optimisticMessage = {
			_id: tempId,
			sender: authUser._id,
			receiver: receiverId,
			content,
			createdAt: new Date().toISOString(), // Add timestamp
			status: "pending", // Add a status
		};

		set((state) => ({
			messages: [...state.messages, optimisticMessage],
		}));

		try {
			const res = await axiosInstance.post("/messages/send", { receiverId, content });
			const sentMessage = res.data.message;

			// Replace the temporary message with the real one from the server
			set((state) => ({
				messages: state.messages.map((msg) => (msg._id === tempId ? sentMessage : msg)),
			}));
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to send message");
			// If sending fails, remove the optimistic message
			set((state) => ({
				messages: state.messages.filter((msg) => msg._id !== tempId),
			}));
		}
	},

	getMessages: async (userId) => {
		try {
			set({ loading: true });
			const res = await axiosInstance.get(`/messages/conversation/${userId}`);
			set({ messages: res.data.messages });
		} catch (error) {
			console.log(error);
			set({ messages: [] });
			toast.error(error.response?.data?.message || "Failed to fetch messages");
		} finally {
			set({ loading: false });
		}
	},

	subscribeToMessages: () => {
		try {
			const socket = getSocket();
			socket.on("newMessage", ({ message }) => {
				// Only add message if it's not already in the list (prevents duplicates from own messages)
				if (!get().messages.some((m) => m._id === message._id)) {
					set((state) => ({ messages: [...state.messages, message] }));
				}
			});
		} catch (error) {
			console.error("Failed to subscribe to messages:", error);
		}
	},

	unsubscribeFromMessages: () => {
		try {
			const socket = getSocket();
			socket.off("newMessage");
		} catch (error) {
			console.error("Failed to unsubscribe from messages:", error);
		}
	},
}));