// client/src/store/useAIStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAIStore = create((set, get) => ({
    chatSuggestions: {},
    conversationStarters: {},
    moodAnalysis: {},
    aiInsights: {},
    isLoading: false,
    error: null,

    // Get chat suggestions for a specific match
    getChatSuggestions: async (matchId, limit = 3) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/ai/suggestions/${matchId}?limit=${limit}`);
            
            set(state => ({
                chatSuggestions: {
                    ...state.chatSuggestions,
                    [matchId]: res.data.suggestions || []
                },
                isLoading: false
            }));

            return res.data.suggestions || [];
        } catch (error) {
            console.error("Error getting chat suggestions:", error);
            set({ isLoading: false });
            return [];
        }
    },

    // Get conversation starters for a match
    getConversationStarters: async (matchId, limit = 3) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/ai/starters/${matchId}?limit=${limit}`);
            
            set(state => ({
                conversationStarters: {
                    ...state.conversationStarters,
                    [matchId]: res.data.starters || []
                },
                isLoading: false
            }));

            return res.data.starters || [];
        } catch (error) {
            console.error("Error getting conversation starters:", error);
            set({ isLoading: false });
            return [];
        }
    },

    // Analyze mood of conversation
    analyzeMood: async (matchId) => {
        try {
            const res = await axiosInstance.get(`/ai/mood/${matchId}`);
            
            set(state => ({
                moodAnalysis: {
                    ...state.moodAnalysis,
                    [matchId]: res.data.moodAnalysis || {}
                }
            }));

            return res.data.moodAnalysis || {};
        } catch (error) {
            console.error("Error analyzing mood:", error);
            return {};
        }
    },

    // Mark suggestion as used
    markSuggestionUsed: async (matchId, suggestionId, effectiveness = 0) => {
        try {
            await axiosInstance.put(`/ai/suggestion/${matchId}/${suggestionId}`, {
                effectiveness
            });
        } catch (error) {
            console.error("Error marking suggestion as used:", error);
        }
    },

    // Get AI insights for a match
    getAIInsights: async (matchId) => {
        try {
            const res = await axiosInstance.get(`/ai/insights/${matchId}`);
            
            set(state => ({
                aiInsights: {
                    ...state.aiInsights,
                    [matchId]: res.data.insights || {}
                }
            }));

            return res.data.insights || {};
        } catch (error) {
            console.error("Error getting AI insights:", error);
            return {};
        }
    },

    // Update AI settings
    updateAISettings: async (settings) => {
        try {
            const res = await axiosInstance.put("/ai/settings", settings);
            toast.success("AI settings updated successfully");
            return res.data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update AI settings';
            toast.error(message);
            throw error;
        }
    },

    // Clear suggestions for a specific match
    clearSuggestions: (matchId) => {
        set(state => {
            const newSuggestions = { ...state.chatSuggestions };
            delete newSuggestions[matchId];
            return { chatSuggestions: newSuggestions };
        });
    },

    // Clear all AI data
    reset: () => set({
        chatSuggestions: {},
        conversationStarters: {},
        moodAnalysis: {},
        aiInsights: {},
        isLoading: false,
        error: null
    })
}));