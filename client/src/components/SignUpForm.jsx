// client/src/components/SignUpForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../context/ThemeContext';

const SignUpForm = () => {
    const { isDark } = useTheme();
    const { signup, loading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
        gender: '',
        genderPreference: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Convert age to number
        const signupData = {
            ...formData,
            age: parseInt(formData.age)
        };
        
        await signup(signupData);
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
            className="space-y-4"
        >
            {/* Name Field */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Name
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={`w-full pl-10 pr-3 py-3 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                            isDark 
                                ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Your full name"
                    />
                </div>
            </div>

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
                        placeholder="your.email@example.com"
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
                        minLength={8}
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                            isDark 
                                ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="At least 8 characters"
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

            {/* Age Field */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Age
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        min="18"
                        max="100"
                        className={`w-full pl-10 pr-3 py-3 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                            isDark 
                                ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Must be 18+"
                    />
                </div>
            </div>

            {/* Gender Selection */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {['male', 'female'].map((gender) => (
                        <button
                            key={gender}
                            type="button"
                            onClick={() => setFormData({ ...formData, gender })}
                            className={`py-3 px-4 rounded-xl border transition-all duration-300 ${
                                formData.gender === gender
                                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300'
                                    : (isDark 
                                        ? 'border-gray-600 text-gray-300 hover:border-gray-500' 
                                        : 'border-gray-300 text-gray-700 hover:border-gray-400')
                            }`}
                        >
                            {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gender Preference */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Show me
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: 'male', label: 'Men' },
                        { value: 'female', label: 'Women' },
                        { value: 'all', label: 'Everyone' }
                    ].map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, genderPreference: option.value })}
                            className={`py-3 px-4 rounded-xl border transition-all duration-300 text-sm ${
                                formData.genderPreference === option.value
                                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300'
                                    : (isDark 
                                        ? 'border-gray-600 text-gray-300 hover:border-gray-500' 
                                        : 'border-gray-300 text-gray-700 hover:border-gray-400')
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
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
                        <span>Creating account...</span>
                    </div>
                ) : (
                    'Create Account'
                )}
            </motion.button>
        </motion.form>
    );
};

export default SignUpForm;