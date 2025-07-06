// client/src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    Moon, 
    Sun, 
    Crown, 
    Shield, 
    Bell, 
    Heart, 
    MapPin, 
    User,
    LogOut,
    Trash2,
    Settings,
    Eye,
    EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Components
import Layout from '../components/Layout';
import BottomNavBar from '../components/BottomNavBar';

// Store
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { usePremiumStore } from '../store/usePremiumStore';
import { useAIStore } from '../store/useAIStore';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme, isDark } = useTheme();
    const { authUser, logout } = useAuthStore();
    const { updatePrivacySettings, updatePreferences, deleteAccount } = useUserStore();
    const { hasFeatureAccess } = usePremiumStore();
    const { updateAISettings } = useAIStore();

    const [settings, setSettings] = useState({
        // Privacy
        incognitoMode: authUser?.incognitoMode || false,
        showReadReceipts: authUser?.showReadReceipts || true,
        showOnlineStatus: authUser?.showOnlineStatus || true,
        
        // Notifications
        pushNotifications: authUser?.pushNotifications || true,
        emailNotifications: authUser?.emailNotifications || true,
        
        // Preferences
        ageRange: authUser?.ageRange || { min: 22, max: 35 },
        maxDistance: authUser?.maxDistance || 25,
        
        // AI
        aiAssistantEnabled: authUser?.aiAssistantEnabled || true,
        aiPersonality: authUser?.aiPersonality || 'helpful'
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    const handlePrivacyUpdate = async (key, value) => {
        try {
            const newSettings = { ...settings, [key]: value };
            setSettings(newSettings);
            
            await updatePrivacySettings({
                incognitoMode: newSettings.incognitoMode,
                showReadReceipts: newSettings.showReadReceipts,
                showOnlineStatus: newSettings.showOnlineStatus,
                pushNotifications: newSettings.pushNotifications,
                emailNotifications: newSettings.emailNotifications
            });
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    const handlePreferencesUpdate = async () => {
        try {
            await updatePreferences({
                ageRange: settings.ageRange,
                maxDistance: settings.maxDistance
            });
            toast.success('Preferences updated');
        } catch (error) {
            toast.error('Failed to update preferences');
        }
    };

    const handleAIUpdate = async (key, value) => {
        try {
            const newSettings = { ...settings, [key]: value };
            setSettings(newSettings);
            
            await updateAISettings({
                aiAssistantEnabled: newSettings.aiAssistantEnabled,
                aiPersonality: newSettings.aiPersonality
            });
        } catch (error) {
            toast.error('Failed to update AI settings');
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error('Please enter your password');
            return;
        }

        try {
            await deleteAccount(deletePassword);
            toast.success('Account deleted successfully');
            navigate('/auth');
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    return (
        <Layout>
            <div className="flex flex-col h-screen">
                <Header />
                
                <div className="flex-1 overflow-y-auto pb-24">
                    <div className="max-w-2xl mx-auto p-6 space-y-8">
                        
                        {/* Account Section */}
                        <Section title="Account" icon={User}>
                            <SettingItem
                                icon={Crown}
                                title="Premium"
                                description={authUser?.isPremium ? "Premium Active" : "Upgrade to Premium"}
                                onClick={() => navigate('/premium')}
                                showArrow
                            />
                            <SettingItem
                                icon={User}
                                title="Edit Profile"
                                description="Update your photos and prompts"
                                onClick={() => navigate('/profile')}
                                showArrow
                            />
                        </Section>

                        {/* Privacy Section */}
                        <Section title="Privacy" icon={Shield}>
                            {hasFeatureAccess('incognito') && (
                                <ToggleItem
                                    icon={settings.incognitoMode ? EyeOff : Eye}
                                    title="Incognito Mode"
                                    description="Browse profiles without being seen"
                                    value={settings.incognitoMode}
                                    onChange={(value) => handlePrivacyUpdate('incognitoMode', value)}
                                />
                            )}
                            <ToggleItem
                                icon={Eye}
                                title="Read Receipts"
                                description="Show when you've read messages"
                                value={settings.showReadReceipts}
                                onChange={(value) => handlePrivacyUpdate('showReadReceipts', value)}
                            />
                            <ToggleItem
                                icon={Heart}
                                title="Show Online Status"
                                description="Let matches see when you're online"
                                value={settings.showOnlineStatus}
                                onChange={(value) => handlePrivacyUpdate('showOnlineStatus', value)}
                            />
                        </Section>

                        {/* Preferences Section */}
                        <Section title="Discovery Preferences" icon={MapPin}>
                            <div className="space-y-4">
                                <div>
                                    <label className={`block font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Age Range: {settings.ageRange.min} - {settings.ageRange.max}
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min="18"
                                            max="50"
                                            value={settings.ageRange.min}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                ageRange: { ...prev.ageRange, min: parseInt(e.target.value) }
                                            }))}
                                            onMouseUp={handlePreferencesUpdate}
                                            className="w-full"
                                        />
                                        <input
                                            type="range"
                                            min="18"
                                            max="50"
                                            value={settings.ageRange.max}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                ageRange: { ...prev.ageRange, max: parseInt(e.target.value) }
                                            }))}
                                            onMouseUp={handlePreferencesUpdate}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className={`block font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Maximum Distance: {settings.maxDistance} miles
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={settings.maxDistance}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            maxDistance: parseInt(e.target.value)
                                        }))}
                                        onMouseUp={handlePreferencesUpdate}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </Section>

                        {/* AI Assistant Section */}
                        <Section title="AI Assistant" icon={Settings}>
                            <ToggleItem
                                icon={Heart}
                                title="AI Chat Suggestions"
                                description="Get personalized conversation suggestions"
                                value={settings.aiAssistantEnabled}
                                onChange={(value) => handleAIUpdate('aiAssistantEnabled', value)}
                            />
                            {settings.aiAssistantEnabled && (
                                <div className="ml-12">
                                    <label className={`block font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        AI Personality
                                    </label>
                                    <select
                                        value={settings.aiPersonality}
                                        onChange={(e) => handleAIUpdate('aiPersonality', e.target.value)}
                                        className={`w-full p-3 rounded-xl border transition-all duration-300 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-800'
                                        }`}
                                    >
                                        <option value="helpful">Helpful & Supportive</option>
                                        <option value="witty">Witty & Humorous</option>
                                        <option value="romantic">Romantic & Charming</option>
                                        <option value="casual">Casual & Friendly</option>
                                    </select>
                                </div>
                            )}
                        </Section>

                        {/* Notifications Section */}
                        <Section title="Notifications" icon={Bell}>
                            <ToggleItem
                                icon={Bell}
                                title="Push Notifications"
                                description="Get notified about matches and messages"
                                value={settings.pushNotifications}
                                onChange={(value) => handlePrivacyUpdate('pushNotifications', value)}
                            />
                            <ToggleItem
                                icon={Bell}
                                title="Email Notifications"
                                description="Receive updates via email"
                                value={settings.emailNotifications}
                                onChange={(value) => handlePrivacyUpdate('emailNotifications', value)}
                            />
                        </Section>

                        {/* Appearance Section */}
                        <Section title="Appearance" icon={Moon}>
                            <ToggleItem
                                icon={isDark ? Moon : Sun}
                                title="Dark Mode"
                                description="Switch between light and dark themes"
                                value={isDark}
                                onChange={toggleTheme}
                            />
                        </Section>

                        {/* Account Actions */}
                        <Section title="Account Actions" icon={Settings}>
                            <SettingItem
                                icon={LogOut}
                                title="Log Out"
                                description="Sign out of your account"
                                onClick={handleLogout}
                                textColor="text-red-500"
                            />
                            <SettingItem
                                icon={Trash2}
                                title="Delete Account"
                                description="Permanently delete your account"
                                onClick={() => setShowDeleteConfirm(true)}
                                textColor="text-red-500"
                            />
                        </Section>
                    </div>
                </div>

                <BottomNavBar />

                {/* Delete Account Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className={`w-full max-w-md p-6 rounded-2xl ${
                            isDark ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                Delete Account
                            </h3>
                            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                This action cannot be undone. Please enter your password to confirm.
                            </p>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className={`w-full p-3 mb-4 rounded-xl border ${
                                    isDark 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-white border-gray-300 text-gray-800'
                                }`}
                            />
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className={`flex-1 py-3 rounded-xl transition-colors duration-300 ${
                                        isDark 
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

// Components
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
                
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Settings
                </h1>
                
                <div className="w-8 h-8" />
            </div>
        </header>
    );
};

const Section = ({ title, icon: Icon, children }) => {
    const { isDark } = useTheme();
    
    return (
        <div className={`rounded-2xl border p-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
            <div className="flex items-center space-x-3 mb-6">
                <Icon className={`w-6 h-6 ${isDark ? 'text-pink-400' : 'text-pink-500'}`} />
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {title}
                </h2>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

const SettingItem = ({ icon: Icon, title, description, onClick, showArrow = false, textColor = '' }) => {
    const { isDark } = useTheme();
    
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-all duration-300 ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
        >
            <Icon className={`w-5 h-5 ${textColor || (isDark ? 'text-gray-400' : 'text-gray-600')}`} />
            <div className="flex-1 text-left">
                <h3 className={`font-medium ${textColor || (isDark ? 'text-white' : 'text-gray-800')}`}>
                    {title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {description}
                </p>
            </div>
            {showArrow && (
                <ArrowLeft className={`w-4 h-4 rotate-180 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
        </button>
    );
};

const ToggleItem = ({ icon: Icon, title, description, value, onChange }) => {
    const { isDark } = useTheme();
    
    return (
        <div className="flex items-center space-x-4 p-3">
            <Icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className="flex-1">
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {description}
                </p>
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value 
                        ? 'bg-pink-500' 
                        : (isDark ? 'bg-gray-600' : 'bg-gray-300')
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );
};

export default SettingsPage;