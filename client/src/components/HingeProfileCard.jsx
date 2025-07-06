// client/src/components/HingeProfileCard.jsx
import React, { useState } from 'react';
import { Heart, X, MessageCircle, Star, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const HingeProfileCard = ({ user, onLike, onPass, onSuperLike, onComment }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPromptIndex, setShowPromptIndex] = useState(0);
    const { isDark } = useTheme();

    const handleImageNavigation = (direction) => {
        if (direction === 'next' && currentImageIndex < user.images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        } else if (direction === 'prev' && currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const calculateAge = (birthDate) => {
        return new Date().getFullYear() - new Date(birthDate).getFullYear();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } transition-all duration-300`}
        >
            {/* Image Section */}
            <div className="relative h-96 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImageIndex}
                        src={user.images[currentImageIndex]}
                        alt={`${user.name} photo ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    />
                </AnimatePresence>
                
                {/* Image Navigation */}
                <div className="absolute inset-0 flex">
                    {user.images.map((_, index) => (
                        <button
                            key={index}
                            className="flex-1 bg-transparent"
                            onClick={() => setCurrentImageIndex(index)}
                        />
                    ))}
                </div>
                
                {/* Image Indicators */}
                <div className="absolute top-4 left-4 right-4 flex space-x-1">
                    {user.images.map((_, index) => (
                        <div
                            key={index}
                            className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                                index === currentImageIndex 
                                    ? 'bg-white' 
                                    : 'bg-white/30'
                            }`}
                        />
                    ))}
                </div>

                {/* Verification Badge */}
                {user.isVerified && (
                    <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-2">
                        <Star className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                )}

                {/* Basic Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {user.name}, {user.age}
                    </h2>
                    <div className="flex items-center space-x-4 text-white/80">
                        {user.job && (
                            <div className="flex items-center space-x-1">
                                <Briefcase className="w-4 h-4" />
                                <span className="text-sm">{user.job}</span>
                            </div>
                        )}
                        {user.school && (
                            <div className="flex items-center space-x-1">
                                <GraduationCap className="w-4 h-4" />
                                <span className="text-sm">{user.school}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className={`p-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {/* Prompts Section */}
                {user.prompts && user.prompts.length > 0 && (
                    <div className="mb-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={showPromptIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={`p-4 rounded-2xl ${
                                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                                } transition-colors duration-300`}
                            >
                                <h3 className={`font-semibold mb-2 ${
                                    isDark ? 'text-pink-300' : 'text-pink-600'
                                }`}>
                                    {user.prompts[showPromptIndex].prompt}
                                </h3>
                                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                    {user.prompts[showPromptIndex].answer}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                        
                        {/* Prompt Navigation */}
                        {user.prompts.length > 1 && (
                            <div className="flex justify-center mt-3 space-x-2">
                                {user.prompts.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setShowPromptIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                            index === showPromptIndex
                                                ? (isDark ? 'bg-pink-400' : 'bg-pink-500')
                                                : (isDark ? 'bg-gray-600' : 'bg-gray-300')
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Compatibility Score */}
                {user.matchScore && (
                    <div className="mb-6">
                        <div className={`p-3 rounded-xl ${
                            isDark ? 'bg-gradient-to-r from-purple-800 to-pink-800' : 'bg-gradient-to-r from-purple-100 to-pink-100'
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className={`font-medium ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
                                    Compatibility
                                </span>
                                <span className={`text-xl font-bold ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>
                                    {user.matchScore}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center space-x-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onPass(user)}
                        className={`p-4 rounded-full border-2 transition-all duration-300 ${
                            isDark 
                                ? 'border-gray-600 text-gray-400 hover:border-red-400 hover:text-red-400 hover:bg-red-400/10'
                                : 'border-gray-300 text-gray-500 hover:border-red-500 hover:text-red-500 hover:bg-red-50'
                        }`}
                    >
                        <X className="w-6 h-6" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onComment(user, user.prompts[showPromptIndex])}
                        className={`p-4 rounded-full border-2 transition-all duration-300 ${
                            isDark 
                                ? 'border-blue-500 text-blue-400 hover:bg-blue-400/10'
                                : 'border-blue-500 text-blue-500 hover:bg-blue-50'
                        }`}
                    >
                        <MessageCircle className="w-6 h-6" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSuperLike(user)}
                        className={`p-4 rounded-full border-2 transition-all duration-300 ${
                            isDark 
                                ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-400/10'
                                : 'border-yellow-500 text-yellow-500 hover:bg-yellow-50'
                        }`}
                    >
                        <Star className="w-6 h-6" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onLike(user)}
                        className={`p-4 rounded-full border-2 transition-all duration-300 ${
                            isDark 
                                ? 'border-pink-500 text-pink-400 hover:bg-pink-400/10'
                                : 'border-pink-500 text-pink-500 hover:bg-pink-50'
                        }`}
                    >
                        <Heart className="w-6 h-6" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default HingeProfileCard;