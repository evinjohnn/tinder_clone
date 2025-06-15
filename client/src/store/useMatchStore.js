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

	// This is the single source of truth for fetching data
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
            toast.error("Failed to load your feeds. Please try refreshing.");
            set({ isLoading: false });
        }
    },

    sendLike: async (user, likedContent, comment = "", isRose = false) => {
        try {
            set((state) => ({
				discoverProfiles: state.discoverProfiles.filter((p) => p._id !== user._id),
                incomingLikes: state.incomingLikes.filter(like => like.sender._id !== user._id)
			}));

            const res = await axiosInstance.post(`/matches/like/${user._id}`, { likedContent, comment, isRose });
            
            if (res.data.matched) {
                toast.success(`It's a match with ${user.name}!`);
                const { getFeeds } = get();
				getFeeds(); // Re-fetch all data to get updated match list and counts
            } else {
                toast.success(isRose ? 'Rose sent!' : 'Like sent!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send like');
            set((state) => ({ discoverProfiles: [user, ...state.discoverProfiles] }));
        }
    },

	subscribeToNewMatches: () => {
		try {
			const socket = getSocket();
			socket.on("newMatch", (newMatch) => {
                toast.success(`You matched with ${newMatch.name}!`);
				get().getFeeds(); // Re-fetch all data to update everything
			});
		} catch (error) {
			console.log(error);
		}
	},

	unsubscribeFromNewMatches: () => {
		try {
			const socket = getSocket();
			socket.off("newMatch");
		} catch (error) {
			console.error(error);
		}
	},
}));