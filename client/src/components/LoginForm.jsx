// client/src/components/LoginForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../context/ThemeContext';

const LoginForm = () => {
    const { isDark } = useTheme();
    const { login, loading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Email Field */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Email
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full pl-10 pr-3 py-3 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                            isDark 
                                ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Enter your email"
                    />
                </div>
            </div>

            {/* Password Field */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                            isDark 
                                ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Enter your password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        {showPassword ? (
                            <EyeOff className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                        ) : (
                            <Eye className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                        )}
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                    </div>
                ) : (
                    'Sign In'
                )}
            </motion.button>
        </motion.form>
    );
};

export default LoginForm;