// client/src/store/useMatchStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../socket/socket.client";

export const useMatchStore = create((set, get) => ({
    matches: [],
    incomingLikes: [],
    discoverProfiles: [],
    standouts: [],
    isLoading: false,
    error: null,

    // Get all feeds
    getFeeds: async () => {
        set({ isLoading: true, error: null });
        try {
            const [discoverRes, likesRes, matchesRes, standoutsRes] = await Promise.all([
                axiosInstance.get("/matches/discover"),
                axiosInstance.get("/matches/likes/incoming"),
                axiosInstance.get("/matches"),
                axiosInstance.get("/matches/standouts").catch(() => ({ data: { users: [] } }))
            ]);

            set({
                discoverProfiles: discoverRes.data.users || [],
                incomingLikes: likesRes.data.likes || [],
                matches: matchesRes.data.matches || [],
                standouts: standoutsRes.data.users || [],
                isLoading: false,
                error: null
            });
        } catch (error) {
            console.error("Error fetching feeds:", error);
            set({ 
                error: error.response?.data?.message || "Failed to load feeds",
                isLoading: false 
            });
            toast.error("Failed to load your feeds.");
        }
    },

    // Send regular like
    sendLike: async (user, likedContent, comment = "") => {
        try {
            const res = await axiosInstance.post(`/matches/like/${user._id}`, { 
                likedContent, 
                comment,
                isRose: false,
                isSuperLike: false
            });
            
            if (res.data.matched) {
                toast.success(`🎉 It's a match with ${user.name}!`);
                
                // Show ice breaker if available
                if (res.data.iceBreaker) {
                    setTimeout(() => {
                        toast(
                            <div className="max-w-sm">
                                <p className="font-medium mb-1">AI Suggested Ice Breaker:</p>
                                <p className="text-sm text-gray-600">{res.data.iceBreaker}</p>
                            </div>,
                            { duration: 6000 }
                        );
                    }, 2000);
                }
                
                get().getFeeds(); // Re-fetch data to update all lists
            } else {
                const message = comment ? 'Like sent with comment!' : 'Like sent!';
                toast.success(message);
            }

            return res.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send like';
            toast.error(message);
            throw error;
        }
    },

    // Send super like
    sendSuperLike: async (user, likedContent, comment = "") => {
        try {
            const res = await axiosInstance.post(`/matches/super-like/${user._id}`, { 
                likedContent, 
                comment 
            });
            
            if (res.data.matched) {
                toast.success(`💫 Super Like Match with ${user.name}!`);
                get().getFeeds();
            } else {
                toast.success(`⭐ Super Like sent! ${res.data.superLikesLeft} left today`);
            }

            return res.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send Super Like';
            toast.error(message);
            throw error;
        }
    },

    // Send rose
    sendRose: async (user, likedContent, comment = "") => {
        try {
            const res = await axiosInstance.post(`/matches/rose/${user._id}`, { 
                likedContent, 
                comment 
            });
            
            if (res.data.matched) {
                toast.success(`🌹 Rose Match with ${user.name}!`);
                get().getFeeds();
            } else {
                toast.success(`🌹 Rose sent! ${res.data.rosesLeft} left`);
            }

            return res.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send Rose';
            toast.error(message);
            throw error;
        }
    },

    // Pass on profile
    passProfile: async (userId) => {
        try {
            await axiosInstance.post(`/matches/pass/${userId}`);
        } catch (error) {
            console.error("Error passing profile:", error);
        }
    },

    // Boost profile
    boostProfile: async () => {
        try {
            const res = await axiosInstance.post("/matches/boost");
            toast.success(`🚀 ${res.data.message}`);
            return res.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to boost profile';
            toast.error(message);
            throw error;
        }
    },

    // Get compatibility score
    getCompatibilityScore: async (userId) => {
        try {
            const res = await axiosInstance.get(`/matches/compatibility/${userId}`);
            return res.data.compatibilityScore;
        } catch (error) {
            console.error("Error getting compatibility score:", error);
            return null;
        }
    },

    // Get discover feed with pagination
    getDiscoverFeed: async (limit = 20, offset = 0) => {
        try {
            const res = await axiosInstance.get(`/matches/discover?limit=${limit}&offset=${offset}`);
            
            if (offset === 0) {
                set({ discoverProfiles: res.data.users || [] });
            } else {
                set(state => ({ 
                    discoverProfiles: [...state.discoverProfiles, ...(res.data.users || [])]
                }));
            }

            return res.data.users || [];
        } catch (error) {
            console.error("Error fetching discover feed:", error);
            toast.error("Failed to load profiles");
            return [];
        }
    },

    // Get standouts feed
    getStandoutsFeed: async () => {
        try {
            const res = await axiosInstance.get("/matches/standouts");
            set({ standouts: res.data.users || [] });
            return res.data.users || [];
        } catch (error) {
            console.error("Error fetching standouts:", error);
            return [];
        }
    },

    // Get incoming likes
    getIncomingLikes: async (limit = 50, offset = 0) => {
        try {
            const res = await axiosInstance.get(`/matches/likes/incoming?limit=${limit}&offset=${offset}`);
            
            if (offset === 0) {
                set({ incomingLikes: res.data.likes || [] });
            } else {
                set(state => ({ 
                    incomingLikes: [...state.incomingLikes, ...(res.data.likes || [])]
                }));
            }

            return res.data.likes || [];
        } catch (error) {
            console.error("Error fetching incoming likes:", error);
            return [];
        }
    },

    // Subscribe to new matches via socket
    subscribeToNewMatches: () => {
        try {
            const socket = getSocket();
            if (!socket) return;

            socket.on("newMatch", (newMatch) => {
                toast.success(`🎉 New match with ${newMatch.name}!`);
                
                // Add to matches
                set(state => ({
                    matches: [newMatch, ...state.matches]
                }));

                // Show ice breaker if available
                if (newMatch.iceBreaker) {
                    setTimeout(() => {
                        toast(
                            <div className="max-w-sm">
                                <p className="font-medium mb-1">AI Suggested Ice Breaker:</p>
                                <p className="text-sm text-gray-600">{newMatch.iceBreaker}</p>
                            </div>,
                            { duration: 6000 }
                        );
                    }, 2000);
                }
            });
        } catch (error) {
            console.log("Error subscribing to new matches:", error);
        }
    },

    // Unsubscribe from new matches
    unsubscribeFromNewMatches: () => {
        try {
            const socket = getSocket();
            if (!socket) return;
            socket.off("newMatch");
        } catch (error) {
            console.error("Error unsubscribing:", error);
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Reset store
    reset: () => set({
        matches: [],
        incomingLikes: [],
        discoverProfiles: [],
        standouts: [],
        isLoading: false,
        error: null
    })
}));