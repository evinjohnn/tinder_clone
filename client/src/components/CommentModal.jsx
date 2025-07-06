// client/src/components/CommentModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CommentModal = ({ isOpen, onClose, user, prompt, onSend }) => {
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { isDark } = useTheme();

    useEffect(() => {
        if (isOpen) {
            setComment('');
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!comment.trim()) return;
        
        setIsLoading(true);
        try {
            await onSend(comment.trim());
            onClose();
        } catch (error) {
            console.error('Error sending comment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`relative w-full max-w-lg mx-4 mb-4 rounded-t-3xl overflow-hidden ${
                            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                        } shadow-2xl`}
                    >
                        {/* Header */}
                        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    Comment on {user?.name}'s response
                                </h3>
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-full transition-colors duration-300 ${
                                        isDark 
                                            ? 'hover:bg-gray-700 text-gray-400' 
                                            : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* User's Prompt */}
                            {prompt && (
                                <div className={`p-4 rounded-2xl ${
                                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                                }`}>
                                    <h4 className={`font-semibold mb-2 ${
                                        isDark ? 'text-pink-300' : 'text-pink-600'
                                    }`}>
                                        {prompt.prompt}
                                    </h4>
                                    <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                        {prompt.answer}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Comment Input */}
                        <div className="p-6">
                            <div className="relative">
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Write a thoughtful comment..."
                                    maxLength={280}
                                    className={`w-full p-4 pr-12 rounded-2xl border resize-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                        isDark 
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                            : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                                    }`}
                                    rows={4}
                                    autoFocus
                                />
                                
                                {/* Character Count */}
                                <div className={`absolute bottom-2 right-12 text-xs ${
                                    comment.length > 250 
                                        ? 'text-red-500' 
                                        : (isDark ? 'text-gray-400' : 'text-gray-500')
                                }`}>
                                    {comment.length}/280
                                </div>
                            </div>

                            {/* Send Button */}
                            <div className="flex justify-between items-center mt-4">
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    This will be sent as a like with your comment
                                </p>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    disabled={!comment.trim() || isLoading}
                                    className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                                        !comment.trim() || isLoading
                                            ? (isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400')
                                            : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                                    }`}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Heart className="w-5 h-5" />
                                            <span>Send Like</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommentModal;