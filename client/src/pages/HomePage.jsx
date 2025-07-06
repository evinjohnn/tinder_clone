// client/src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Crown, Heart, MessageCircle, Star, Frown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Components
import Layout from '../components/Layout';
import HingeProfileCard from '../components/HingeProfileCard';
import BottomNavBar from '../components/BottomNavBar';
import CommentModal from '../components/CommentModal';

// Store
import { useMatchStore } from '../store/useMatchStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../context/ThemeContext';

const HomePage = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { authUser } = useAuthStore();
    const { 
        discoverProfiles, 
        isLoading, 
        getFeeds, 
        sendLike,
        sendSuperLike,
        sendRose,
        subscribeToNewMatches,
        unsubscribeFromNewMatches
    } = useMatchStore();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    useEffect(() => {
        if (authUser) {
            getFeeds();
            subscribeToNewMatches();
        }

        return () => {
            if (authUser) {
                unsubscribeFromNewMatches();
            }
        };
    }, [authUser, getFeeds, subscribeToNewMatches, unsubscribeFromNewMatches]);

    const currentProfile = discoverProfiles[currentIndex];

    const handleLike = async (user) => {
        try {
            await sendLike(user, "their profile");
            setCurrentIndex(prev => prev + 1);
        } catch (error) {
            toast.error("Failed to send like");
        }
    };

    const handleSuperLike = async (user) => {
        try {
            await sendSuperLike(user, "their profile");
            setCurrentIndex(prev => prev + 1);
        } catch (error) {
            toast.error("Failed to send super like");
        }
    };

    const handlePass = () => {
        setCurrentIndex(prev => prev + 1);
    };

    const handleComment = (user, prompt) => {
        setSelectedUser(user);
        setSelectedPrompt(prompt);
        setShowCommentModal(true);
    };

    const handleSendComment = async (comment) => {
        try {
            await sendLike(selectedUser, selectedPrompt.prompt, comment);
            setShowCommentModal(false);
            setCurrentIndex(prev => prev + 1);
            toast.success("Comment sent!");
        } catch (error) {
            toast.error("Failed to send comment");
        }
    };

    if (isLoading && discoverProfiles.length === 0) {
        return (
            <Layout>
                <div className="flex flex-col h-screen">
                    <Header />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 relative">
                                <div className={`w-16 h-16 rounded-full border-4 ${
                                    isDark ? 'border-pink-800' : 'border-pink-200'
                                }`}></div>
                                <div className="w-16 h-16 rounded-full border-4 border-pink-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${
                                isDark ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                                Finding your perfect matches...
                            </h3>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                This might take a moment
                            </p>
                        </div>
                    </div>
                    <BottomNavBar />
                </div>
            </Layout>
        );
    }

    if (!currentProfile) {
        return (
            <Layout>
                <div className="flex flex-col h-screen">
                    <Header />
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                            <Frown className={`w-16 h-16 mx-auto mb-4 ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <h2 className={`text-2xl font-bold mb-2 ${
                                isDark ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                                That's everyone for now!
                            </h2>
                            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Check back later for new profiles, or adjust your preferences.
                            </p>
                            <button
                                onClick={() => navigate('/settings')}
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
                            >
                                Adjust Preferences
                            </button>
                        </div>
                    </div>
                    <BottomNavBar />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col h-screen">
                <Header />
                
                <div className="flex-1 flex items-center justify-center p-4 pb-24">
                    <AnimatePresence mode="wait">
                        <HingeProfileCard
                            key={currentProfile._id}
                            user={currentProfile}
                            onLike={handleLike}
                            onSuperLike={handleSuperLike}
                            onPass={handlePass}
                            onComment={handleComment}
                        />
                    </AnimatePresence>
                </div>

                <BottomNavBar />

                {/* Comment Modal */}
                <CommentModal
                    isOpen={showCommentModal}
                    onClose={() => setShowCommentModal(false)}
                    user={selectedUser}
                    prompt={selectedPrompt}
                    onSend={handleSendComment}
                />
            </div>
        </Layout>
    );
};

// Header Component
const Header = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { authUser } = useAuthStore();

    return (
        <header className={`px-6 py-4 border-b ${
            isDark ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white/80'
        } backdrop-blur-lg`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" fill="currentColor" />
                    </div>
                    <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Hinge
                    </h1>
                </div>

                <div className="flex items-center space-x-2">
                    {authUser?.isPremium && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full">
                            <Crown className="w-4 h-4 text-white" />
                            <span className="text-xs font-semibold text-white">Premium</span>
                        </div>
                    )}
                    
                    <button
                        onClick={() => navigate('/settings')}
                        className={`p-2 rounded-full transition-colors duration-300 ${
                            isDark 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default HomePage;