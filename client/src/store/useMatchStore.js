// client/src/store/useMatchStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../socket/socket.client";

export const useMatchStore = create((set, get) => ({
	matches: [],
	incomingLikes: [],
	isLoadingMyMatches: false,
	isLoadingUserProfiles: false,
    isLoadingIncomingLikes: false,
	userProfiles: [],
	
	getMyMatches: async () => {
        try {
            set({ isLoadingMyMatches: true });
            const res = await axiosInstance.get("/matches");
            set({ matches: res.data.matches });
        } catch (error) {
            set({ matches: [] });
        } finally {
            set({ isLoadingMyMatches: false });
        }
    },

	getUserProfiles: async () => {
        try {
            set({ isLoadingUserProfiles: true });
            const res = await axiosInstance.get("/matches/user-profiles");
            set({ userProfiles: res.data.users });
        } catch (error) {
            set({ userProfiles: [] });
        } finally {
            set({ isLoadingUserProfiles: false });
        }
    },

    // NEW: Get incoming likes for the "Likes You" tab
    getIncomingLikes: async () => {
        try {
            set({ isLoadingIncomingLikes: true });
            const res = await axiosInstance.get('/matches/likes/incoming');
            set({ incomingLikes: res.data.likes });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to get likes');
        } finally {
            set({ isLoadingIncomingLikes: false });
        }
    },

    // NEW: Replaces swipeRight
	sendLike: async (user, likedContent, comment) => {
        try {
            // Immediately remove profile from the discover feed
            set((state) => ({
				userProfiles: state.userProfiles.filter((p) => p._id !== user._id),
			}));

            const res = await axiosInstance.post(`/matches/like/${user._id}`, { likedContent, comment });
            
            if (res.data.matched) {
                toast.success(`It's a match with ${user.name}!`);
                // Add to matches list
                set((state) => ({ matches: [...state.matches, user] }));
            } else {
                toast.success('Like sent!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send like');
            // Optional: put user back in the feed if like fails
            set((state) => ({ userProfiles: [user, ...state.userProfiles] }));
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