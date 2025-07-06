// client/src/lib/axios.js
import axios from "axios";

// Get the backend URL from environment variables
const getBackendURL = () => {
    // Check for Vite environment variables first
    if (import.meta.env.VITE_BACKEND_URL) {
        return import.meta.env.VITE_BACKEND_URL;
    }
    
    // Check for React environment variables (for compatibility)
    if (process.env.REACT_APP_BACKEND_URL) {
        return process.env.REACT_APP_BACKEND_URL;
    }
    
    // Fallback to localhost for development
    return "http://localhost:5000";
};

export const axiosInstance = axios.create({
    baseURL: `${getBackendURL()}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout for image uploads
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Add any auth tokens or other headers here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const { response, config } = error;
        
        // Handle 401 (Unauthorized) errors
        if (response?.status === 401) {
            // Try to refresh token
            try {
                await axiosInstance.post('/auth/refresh');
                // Retry the original request
                return axiosInstance(config);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth';
                }
                return Promise.reject(refreshError);
            }
        }
        
        // Handle 423 (Locked) errors
        if (response?.status === 423) {
            if (typeof window !== 'undefined') {
                // Account locked, show message and redirect
                alert('Your account has been temporarily locked. Please try again later.');
                window.location.href = '/auth';
            }
        }
        
        // Handle network errors
        if (!response) {
            console.error('Network error:', error.message);
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;