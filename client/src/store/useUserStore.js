// client/src/store/useUserStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useUserStore = create((set) => ({
	loading: false,

	updateProfile: async (data) => {
		try {
			set({ loading: true });
			const res = await axiosInstance.put("/users/update", data);
			useAuthStore.getState().setAuthUser(res.data.user);
			toast.success("Profile updated successfully");
			return true; // NEW: Return true on success
		} catch (error) {
			toast.error(error.response?.data?.message || "Something went wrong");
			return false; // NEW: Return false on failure
		} finally {
			set({ loading: false });
		}
	},
}));