// client/src/components/BottomNavBar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Star, MessageCircle, User, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/useAuthStore';

const BottomNavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark } = useTheme();
    const { authUser } = useAuthStore();

    const navItems = [
        {
            path: '/',
            icon: Heart,
            label: 'Discover',
            isActive: location.pathname === '/'
        },
        {
            path: '/likes',
            icon: Star,
            label: 'Likes',
            isActive: location.pathname === '/likes'
        },
        {
            path: '/standouts',
            icon: Crown,
            label: 'Standouts',
            isActive: location.pathname === '/standouts',
            isPremium: true
        },
        {
            path: '/chat',
            icon: MessageCircle,
            label: 'Matches',
            isActive: location.pathname.startsWith('/chat')
        },
        {
            path: '/profile',
            icon: User,
            label: 'Profile',
            isActive: location.pathname === '/profile'
        }
    ];

    return (
        <div className={`fixed bottom-0 left-0 right-0 border-t backdrop-blur-lg z-50 ${
            isDark 
                ? 'bg-gray-800/90 border-gray-700' 
                : 'bg-white/90 border-gray-200'
        }`}>
            <div className="flex items-center justify-around py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isDisabled = item.isPremium && !authUser?.isPremium;
                    
                    return (
                        <motion.button
                            key={item.path}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (isDisabled) {
                                    navigate('/premium');
                                } else {
                                    navigate(item.path);
                                }
                            }}
                            className={`flex flex-col items-center p-3 transition-all duration-300 ${
                                isDisabled
                                    ? (isDark ? 'text-gray-600' : 'text-gray-400')
                                    : item.isActive
                                        ? (isDark ? 'text-pink-400' : 'text-pink-500')
                                        : (isDark ? 'text-gray-400' : 'text-gray-600')
                            }`}
                            disabled={false} // Allow clicking even for premium features to show upgrade page
                        >
                            <div className="relative">
                                <Icon 
                                    className={`w-6 h-6 ${
                                        item.isActive ? 'fill-current' : ''
                                    }`} 
                                />
                                {item.isPremium && !authUser?.isPremium && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                                        <Crown className="w-2 h-2 text-white" />
                                    </div>
                                )}
                            </div>
                            <span className={`text-xs mt-1 font-medium ${
                                item.isActive ? 'font-semibold' : ''
                            }`}>
                                {item.label}
                            </span>
                            {item.isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-500 rounded-full"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNavBar;