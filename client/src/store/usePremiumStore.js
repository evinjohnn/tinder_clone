// client/src/store/usePremiumStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePremiumStore = create((set, get) => ({
    premiumStatus: null,
    featureUsage: [],
    isLoading: false,
    error: null,

    // Get premium status
    getPremiumStatus: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/premium/status");
            set({ 
                premiumStatus: res.data.premiumStatus,
                isLoading: false,
                error: null 
            });
            return res.data.premiumStatus;
        } catch (error) {
            console.error("Error getting premium status:", error);
            set({ isLoading: false, error: error.response?.data?.message });
            return null;
        }
    },

    // Purchase premium
    purchasePremium: async (plan) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.post("/premium/purchase", { plan });
            
            set(state => ({
                premiumStatus: {
                    ...state.premiumStatus,
                    isPremium: true,
                    premiumExpiry: res.data.user.premiumExpiry,
                    superLikesDaily: res.data.user.superLikesDaily,
                    boostCredits: res.data.user.boostCredits,
                    roses: res.data.user.roses
                },
                isLoading: false
            }));

            toast.success(res.data.message);
            return res.data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to purchase premium';
            toast.error(message);
            set({ isLoading: false });
            throw error;
        }
    },

    // Use advanced filters
    useAdvancedFilters: async (filters) => {
        try {
            const res = await axiosInstance.post("/premium/filters", { filters });
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to apply filters';
            toast.error(message);
            throw error;
        }
    },

    // Activate incognito mode
    activateIncognitoMode: async (duration = 24) => {
        try {
            const res = await axiosInstance.post("/premium/incognito", { duration });
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to activate incognito mode';
            toast.error(message);
            throw error;
        }
    },

    // Deactivate incognito mode
    deactivateIncognitoMode: async () => {
        try {
            const res = await axiosInstance.delete("/premium/incognito");
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to deactivate incognito mode';
            toast.error(message);
            throw error;
        }
    },

    // Use passport feature
    usePassport: async (location) => {
        try {
            const res = await axiosInstance.post("/premium/passport", { location });
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to use passport';
            toast.error(message);
            throw error;
        }
    },

    // Get feature usage
    getFeatureUsage: async () => {
        try {
            const res = await axiosInstance.get("/premium/features");
            set({ featureUsage: res.data.features || [] });
            return res.data.features || [];
        } catch (error) {
            console.error("Error getting feature usage:", error);
            return [];
        }
    },

    // Check if user has access to feature
    hasFeatureAccess: (featureName) => {
        const status = get().premiumStatus;
        if (!status) return false;
        
        return status.isPremium && status.features[featureName];
    },

    // Get remaining daily limits
    getDailyLimits: () => {
        const status = get().premiumStatus;
        if (!status) return null;
        
        return {
            superLikes: status.superLikesDaily - status.superLikesUsed,
            boostCredits: status.boostCredits,
            roses: status.roses
        };
    },

    // Reset store
    reset: () => set({
        premiumStatus: null,
        featureUsage: [],
        isLoading: false,
        error: null
    })
}));