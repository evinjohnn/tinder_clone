// client/src/store/useMatchStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../socket/socket.client";

export const useMatchStore = create((set, get) => ({
	matches: [],
	incomingLikes: [],
	discoverProfiles: [],
	isLoading: false,

	getFeeds: async () => {
        set({ isLoading: true });
        try {
            const [discoverRes, likesRes, matchesRes] = await Promise.all([
                axiosInstance.get("/matches/discover"),
                axiosInstance.get("/matches/likes/incoming"),
                axiosInstance.get("/matches"),
            ]);
            set({
                discoverProfiles: discoverRes.data.users,
                incomingLikes: likesRes.data.likes,
                matches: matchesRes.data.matches,
                isLoading: false,
            });
        } catch (error) {
            console.error("Error fetching feeds:", error);
            toast.error("Failed to load your feeds.");
            set({ isLoading: false });
        }
    },

    sendLike: async (user, likedContent, comment = "", isRose = false) => {
        try {
            const res = await axiosInstance.post(`/matches/like/${user._id}`, { likedContent, comment, isRose });
            
            if (res.data.matched) {
                toast.success(`It's a match with ${user.name}!`);
                get().getFeeds(); // Re-fetch data to update all lists
            } else {
                toast.success(isRose ? 'Rose sent!' : 'Like sent!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send like');
        }
    },

	subscribeToNewMatches: () => {
		try {
			const socket = getSocket();
			socket.on("newMatch", (newMatch) => {
                toast.success(`You matched with ${newMatch.name}!`);
				get().getFeeds();
			});
		} catch (error) {
			console.log("Error subscribing to new matches:", error);
		}
	},

	unsubscribeFromNewMatches: () => {
		try {
			const socket = getSocket();
			socket.off("newMatch");
		} catch (error) {
			console.error("Error unsubscribing:", error);
		}
	},
}));