// client/src/store/useAuthStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { disconnectSocket, initializeSocket } from "../socket/socket.client";

export const useAuthStore = create((set) => ({
	authUser: null,
	checkingAuth: true,
	loading: false,

	signup: async (signupData) => {
		try {
			set({ loading: true });
			const res = await axiosInstance.post("/auth/signup", signupData);
			set({ authUser: res.data.user });
			// FIX: Ensure user ID exists before initializing socket
			if (res.data.user?._id) {
				initializeSocket(res.data.user._id);
			}
			toast.success("Account created! Let's build your profile.");
			return true;
		} catch (error) {
			toast.error(error.response?.data?.message || "Something went wrong");
			return false;
		} finally {
			set({ loading: false });
		}
	},
	login: async (loginData) => {
		try {
			set({ loading: true });
			const res = await axiosInstance.post("/auth/login", loginData);
			set({ authUser: res.data.user });
			if (res.data.user?._id) {
				initializeSocket(res.data.user._id);
			}
			toast.success("Logged in successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Something went wrong");
		} finally {
			set({ loading: false });
		}
	},
	logout: async () => {
		try {
			await axiosInstance.post("/auth/logout");
			disconnectSocket();
			set({ authUser: null });
		} catch (error) {
			toast.error(error.response?.data?.message || "Something went wrong");
		}
	},
	checkAuth: async () => {
		try {
			set({ checkingAuth: true });
			const res = await axiosInstance.get("/auth/me");
			if (res.data.user?._id) {
				initializeSocket(res.data.user._id);
			}
			set({ authUser: res.data.user });
		} catch (error) {
			set({ authUser: null });
		} finally {
			set({ checkingAuth: false });
		}
	},
	setAuthUser: (user) => set({ authUser: user }),
}));