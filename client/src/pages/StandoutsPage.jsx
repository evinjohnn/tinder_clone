// client/src/pages/StandoutsPage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Heart, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Components
import Layout from '../components/Layout';
import HingeProfileCard from '../components/HingeProfileCard';
import BottomNavBar from '../components/BottomNavBar';

// Store
import { useMatchStore } from '../store/useMatchStore';
import { usePremiumStore } from '../store/usePremiumStore';
import { useTheme } from '../context/ThemeContext';

const StandoutsPage = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { standouts, getStandoutsFeed, sendRose, isLoading } = useMatchStore();
    const { hasFeatureAccess } = usePremiumStore();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (hasFeatureAccess('standouts')) {
            getStandoutsFeed();
        }
    }, [getStandoutsFeed, hasFeatureAccess]);

    const handleSendRose = async (user) => {
        try {
            await sendRose(user, "your standout profile");
            setCurrentIndex(prev => prev + 1);
        } catch (error) {
            toast.error("Failed to send rose");
        }
    };

    const handleLike = async (user) => {
        try {
            await sendLike(user, "your standout profile");
            setCurrentIndex(prev => prev + 1);
        } catch (error) {
            toast.error("Failed to send like");
        }
    };

    const handlePass = () => {
        setCurrentIndex(prev => prev + 1);
    };

    if (!hasFeatureAccess('standouts')) {
        return (
            <Layout>
                <div className="flex flex-col h-screen">
                    <Header />
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center max-w-md">
                            <Crown className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                Standouts
                            </h2>
                            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Discover the most liked profiles in your area. Upgrade to Premium to see Standouts.
                            </p>
                            <button
                                onClick={() => navigate('/premium')}
                                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                            >
                                Upgrade to Premium
                            </button>
                        </div>
                    </div>
                    <BottomNavBar />
                </div>
            </Layout>
        );
    }

    if (isLoading && standouts.length === 0) {
        return (
            <Layout>
                <div className="flex flex-col h-screen">
                    <Header />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 relative">
                                <Crown className={`w-16 h-16 ${isDark ? 'text-yellow-400' : 'text-yellow-500'} animate-pulse`} />
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                Finding standout profiles...
                            </h3>
                        </div>
                    </div>
                    <BottomNavBar />
                </div>
            </Layout>
        );
    }

    const currentProfile = standouts[currentIndex];

    if (!currentProfile) {
        return (
            <Layout>
                <div className="flex flex-col h-screen">
                    <Header />
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                            <Crown className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                No more standouts!
                            </h2>
                            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Check back tomorrow for new standout profiles.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
                            >
                                Back to Discover
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
                    <motion.div
                        key={currentProfile._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >
                        {/* Standout Badge */}
                        <div className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-3 shadow-lg">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        
                        <HingeProfileCard
                            user={currentProfile}
                            onLike={handleLike}
                            onSuperLike={handleSendRose}
                            onPass={handlePass}
                            onComment={() => {}}
                        />
                    </motion.div>
                </div>

                <BottomNavBar />
            </div>
        </Layout>
    );
};

const Header = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    return (
        <header className={`px-6 py-4 border-b ${
            isDark ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white/80'
        } backdrop-blur-lg`}>
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className={`p-2 rounded-full transition-colors duration-300 ${
                        isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2">
                    <Crown className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                    <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Standouts
                    </h1>
                </div>

                <div className="w-8 h-8" /> {/* Spacer */}
            </div>
        </header>
    );
};

export default StandoutsPage;