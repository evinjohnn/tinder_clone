// client/src/store/useUserStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useUserStore = create((set, get) => ({
    loading: false,
    error: null,

    // Update user profile
    updateProfile: async (profileData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.put("/users/update", profileData);
            set({ loading: false });
            toast.success(res.data.message || "Profile updated successfully");
            return res.data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile';
            set({ loading: false, error: message });
            toast.error(message);
            return null;
        }
    },

    // Upload photo verification
    uploadPhotoVerification: async (verificationPhoto) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.post("/users/verify-photo", { verificationPhoto });
            set({ loading: false });
            toast.success(res.data.message);
            return res.data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to upload verification photo';
            set({ loading: false });
            toast.error(message);
            throw error;
        }
    },

    // Update privacy settings
    updatePrivacySettings: async (settings) => {
        try {
            const res = await axiosInstance.put("/users/privacy", settings);
            toast.success(res.data.message);
            return res.data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update privacy settings';
            toast.error(message);
            throw error;
        }
    },

    // Update preferences
    updatePreferences: async (preferences) => {
        try {
            const res = await axiosInstance.put("/users/preferences", preferences);
            toast.success(res.data.message);
            return res.data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update preferences';
            toast.error(message);
            throw error;
        }
    },

    // Block user
    blockUser: async (userId) => {
        try {
            const res = await axiosInstance.post(`/users/block/${userId}`);
            toast.success(res.data.message);
            return res.data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to block user';
            toast.error(message);
            throw error;
        }
    },

    // Unblock user
    unblockUser: async (userId) => {
        try {
            const res = await axiosInstance.delete(`/users/block/${userId}`);
            toast.success(res.data.message);
            return res.data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to unblock user';
            toast.error(message);
            throw error;
        }
    },

    // Report user
    reportUser: async (userId, reason, description) => {
        try {
            const res = await axiosInstance.post(`/users/report/${userId}`, { reason, description });
            toast.success(res.data.message);
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to report user';
            toast.error(message);
            throw error;
        }
    },

    // Get user profile
    getUserProfile: async (userId) => {
        try {
            const res = await axiosInstance.get(`/users/profile/${userId}`);
            return res.data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to get user profile';
            toast.error(message);
            return null;
        }
    },

    // Delete account
    deleteAccount: async (password) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.delete("/users/account", { data: { password } });
            set({ loading: false });
            toast.success(res.data.message);
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete account';
            set({ loading: false });
            toast.error(message);
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Reset store
    reset: () => set({
        loading: false,
        error: null
    })
}));