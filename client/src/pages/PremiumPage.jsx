// client/src/pages/PremiumPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Crown, 
    Check, 
    Star, 
    Heart, 
    Eye, 
    MapPin, 
    Zap,
    ArrowLeft,
    Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Components
import Layout from '../components/Layout';
import BottomNavBar from '../components/BottomNavBar';

// Store
import { usePremiumStore } from '../store/usePremiumStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../context/ThemeContext';

const PREMIUM_PLANS = [
    {
        id: 'weekly',
        name: 'Weekly',
        price: '$9.99',
        duration: 'per week',
        features: ['5 Super Likes daily', 'See who likes you', 'Unlimited likes'],
        recommended: false
    },
    {
        id: 'monthly',
        name: 'Monthly',
        price: '$19.99',
        duration: 'per month',
        features: ['10 Super Likes daily', 'See who likes you', 'Unlimited likes', '1 Boost per month', '5 Roses'],
        recommended: true
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: '$99.99',
        duration: 'per year',
        features: ['15 Super Likes daily', 'See who likes you', 'Unlimited likes', '5 Boosts', '10 Roses', 'Advanced filters', 'Incognito mode'],
        recommended: false,
        savings: 'Save 58%'
    }
];

const PREMIUM_FEATURES = [
    {
        icon: Star,
        title: 'Super Likes',
        description: 'Stand out with Super Likes that get you 3x more matches',
        color: 'text-yellow-500'
    },
    {
        icon: Heart,
        title: 'See Who Likes You',
        description: 'Skip the guesswork and see everyone who already likes you',
        color: 'text-pink-500'
    },
    {
        icon: Zap,
        title: 'Boost',
        description: 'Be the top profile in your area for 30 minutes',
        color: 'text-blue-500'
    },
    {
        icon: Eye,
        title: 'Incognito Mode',
        description: 'Browse profiles privately without being seen',
        color: 'text-purple-500'
    },
    {
        icon: MapPin,
        title: 'Passport',
        description: 'Swipe around the world and match with people anywhere',
        color: 'text-green-500'
    },
    {
        icon: Sparkles,
        title: 'Advanced Filters',
        description: 'Filter by education, height, lifestyle, and more',
        color: 'text-orange-500'
    }
];

const PremiumPage = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { authUser } = useAuthStore();
    const { premiumStatus, purchasePremium, getPremiumStatus, isLoading } = usePremiumStore();
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    useEffect(() => {
        getPremiumStatus();
    }, [getPremiumStatus]);

    const handlePurchase = async () => {
        try {
            await purchasePremium(selectedPlan);
            toast.success('Premium activated! Enjoy your new features.');
            navigate('/');
        } catch (error) {
            toast.error('Failed to purchase premium');
        }
    };

    const formatExpiryDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Layout>
            <div className="flex flex-col h-screen">
                <Header />
                
                <div className="flex-1 overflow-y-auto pb-24">
                    <div className="max-w-2xl mx-auto p-6">
                        
                        {/* Current Status */}
                        {premiumStatus?.isPremium && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mb-8 p-6 rounded-2xl border ${
                                    isDark 
                                        ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-700' 
                                        : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                                }`}
                            >
                                <div className="flex items-center space-x-3 mb-4">
                                    <Crown className="w-8 h-8 text-yellow-500" />
                                    <div>
                                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            Premium Active
                                        </h2>
                                        <p className={`${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                                            Expires: {formatExpiryDate(premiumStatus.premiumExpiry)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4">
                                    <div className={`text-center p-3 rounded-xl ${
                                        isDark ? 'bg-gray-800/50' : 'bg-white/50'
                                    }`}>
                                        <div className={`text-2xl font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                                            {premiumStatus.superLikesDaily - premiumStatus.superLikesUsed}
                                        </div>
                                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Super Likes Left
                                        </div>
                                    </div>
                                    <div className={`text-center p-3 rounded-xl ${
                                        isDark ? 'bg-gray-800/50' : 'bg-white/50'
                                    }`}>
                                        <div className={`text-2xl font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                                            {premiumStatus.boostCredits}
                                        </div>
                                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Boosts
                                        </div>
                                    </div>
                                    <div className={`text-center p-3 rounded-xl ${
                                        isDark ? 'bg-gray-800/50' : 'bg-white/50'
                                    }`}>
                                        <div className={`text-2xl font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                                            {premiumStatus.roses}
                                        </div>
                                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Roses
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Hero Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-8"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                                <Crown className="w-8 h-8 text-white" />
                            </div>
                            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                Upgrade to Premium
                            </h1>
                            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Get the most out of your dating experience
                            </p>
                        </motion.div>

                        {/* Features Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                        >
                            {PREMIUM_FEATURES.map((feature, index) => (
                                <div
                                    key={feature.title}
                                    className={`p-4 rounded-2xl border transition-all duration-300 ${
                                        isDark 
                                            ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <feature.icon className={`w-8 h-8 ${feature.color} mb-3`} />
                                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        {feature.title}
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </motion.div>

                        {/* Pricing Plans */}
                        {!premiumStatus?.isPremium && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mb-8"
                            >
                                <h2 className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    Choose Your Plan
                                </h2>
                                
                                <div className="space-y-4">
                                    {PREMIUM_PLANS.map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setSelectedPlan(plan.id)}
                                            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                                selectedPlan === plan.id
                                                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                                                    : (isDark 
                                                        ? 'border-gray-700 bg-gray-800 hover:border-gray-600' 
                                                        : 'border-gray-200 bg-white hover:border-gray-300')
                                            }`}
                                        >
                                            {plan.recommended && (
                                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                                    Most Popular
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                        {plan.name}
                                                    </h3>
                                                    <div className="flex items-baseline space-x-1">
                                                        <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                            {plan.price}
                                                        </span>
                                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {plan.duration}
                                                        </span>
                                                    </div>
                                                    {plan.savings && (
                                                        <span className="text-green-500 text-sm font-semibold">
                                                            {plan.savings}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                    selectedPlan === plan.id
                                                        ? 'border-pink-500 bg-pink-500'
                                                        : (isDark ? 'border-gray-600' : 'border-gray-300')
                                                }`}>
                                                    {selectedPlan === plan.id && (
                                                        <Check className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <ul className="space-y-2">
                                                {plan.features.map((feature, index) => (
                                                    <li key={index} className="flex items-center space-x-2">
                                                        <Check className="w-4 h-4 text-green-500" />
                                                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Purchase Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handlePurchase}
                                    disabled={isLoading}
                                    className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-semibold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        `Upgrade for ${PREMIUM_PLANS.find(p => p.id === selectedPlan)?.price}`
                                    )}
                                </motion.button>
                                
                                <p className={`text-center text-xs mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Cancel anytime. Terms and conditions apply.
                                </p>
                            </motion.div>
                        )}
                    </div>
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
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Premium
                    </h1>
                </div>
                
                <div className="w-8 h-8" />
            </div>
        </header>
    );
};

export default PremiumPage;