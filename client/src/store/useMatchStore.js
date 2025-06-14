// client/src/store/useMatchStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../socket/socket.client";

export const useMatchStore = create((set, get) => ({
	matches: [],
	incomingLikes: [],
	discoverProfiles: [],
    standoutProfiles: [],
	isLoading: false,

    // Unified function to fetch all necessary data for the main pages
	getFeeds: async () => {
        set({ isLoading: true });
        try {
            // Promise.all to fetch everything concurrently for speed
            const [discoverRes, standoutsRes, likesRes, matchesRes] = await Promise.all([
                axiosInstance.get("/matches/discover"),
                axiosInstance.get("/matches/standouts"),
                axiosInstance.get("/matches/likes/incoming"),
                axiosInstance.get("/matches"),
            ]);
            set({
                discoverProfiles: discoverRes.data.users,
                standoutProfiles: standoutsRes.data.users,
                incomingLikes: likesRes.data.likes,
                matches: matchesRes.data.matches,
                isLoading: false,
            });
        } catch (error) {
            toast.error("Failed to load your feeds. Please try refreshing.");
            set({ isLoading: false });
        }
    },

    // A single, powerful function to handle both likes and roses
    sendLike: async (user, likedContent, comment = "", isRose = false) => {
        try {
            // Optimistically remove the user from all potential feeds on the frontend
            set((state) => ({
				discoverProfiles: state.discoverProfiles.filter((p) => p._id !== user._id),
                standoutProfiles: state.standoutProfiles.filter((p) => p._id !== user._id),
                incomingLikes: state.incomingLikes.filter(like => like.sender._id !== user._id) // Also remove from incoming likes if matching back
			}));

            const res = await axiosInstance.post(`/matches/like/${user._id}`, { likedContent, comment, isRose });
            
            if (res.data.matched) {
                toast.success(`It's a match with ${user.name}!`);
                // Add the new match to the matches list
                // We need to fetch the full user object to add it correctly
                set((state) => ({ matches: [...state.matches, user] }));
            } else {
                toast.success(isRose ? 'Rose sent!' : 'Like sent!');
            }
            // Optionally, update the user's rose count in the auth store
            if (isRose && res.data.rosesLeft !== undefined) {
                const { useAuthStore } = await import('./useAuthStore');
                useAuthStore.setState(state => ({
                    authUser: { ...state.authUser, roses: res.data.rosesLeft }
                }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send like');
            // Re-add the user to the feed if the API call fails
            set((state) => ({ discoverProfiles: [user, ...state.discoverProfiles] }));
        }
    },

	subscribeToNewMatches: () => {
		try {
			const socket = getSocket();
			socket.on("newMatch", (newMatch) => {
				set((state) => ({
					matches: [...state.matches, newMatch],
				}));
				toast.success(`You matched with ${newMatch.name}!`);
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