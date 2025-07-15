// client/src/components/AIAssistantPanel.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bot, 
    MessageCircle, 
    Heart, 
    Calendar, 
    TrendingUp, 
    AlertTriangle, 
    Sparkles,
    ChevronRight,
    Copy,
    Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const AIAssistantPanel = ({ matchId, isOpen, onClose }) => {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('suggestions');
    const [loading, setLoading] = useState({});
    const [data, setData] = useState({
        suggestions: [],
        iceBreakers: [],
        dateIdeas: [],
        topics: [],
        compatibility: null,
        flirtingTips: [],
        dashboard: null
    });
    const [copiedText, setCopiedText] = useState('');

    const tabs = [
        { id: 'suggestions', label: 'Chat Help', icon: MessageCircle },
        { id: 'iceBreakers', label: 'Ice Breakers', icon: Sparkles },
        { id: 'dateIdeas', label: 'Date Ideas', icon: Calendar },
        { id: 'compatibility', label: 'Compatibility', icon: Heart },
        { id: 'flirtingTips', label: 'Flirting Tips', icon: TrendingUp },
        { id: 'dashboard', label: 'Dashboard', icon: Bot }
    ];

    useEffect(() => {
        if (isOpen && matchId) {
            fetchData(activeTab);
        }
    }, [isOpen, matchId, activeTab]);

    const fetchData = async (tab) => {
        setLoading(prev => ({ ...prev, [tab]: true }));
        try {
            let response;
            switch (tab) {
                case 'suggestions':
                    response = await api.get(`/ai/suggestions/${matchId}`);
                    setData(prev => ({ ...prev, suggestions: response.data.suggestions }));
                    break;
                case 'iceBreakers':
                    response = await api.get(`/ai-enhanced/icebreakers/${matchId}`);
                    setData(prev => ({ ...prev, iceBreakers: response.data.iceBreakers }));
                    break;
                case 'dateIdeas':
                    response = await api.post(`/ai-enhanced/date-ideas/${matchId}`, {
                        preferences: { budget: 'any', location: 'any' }
                    });
                    setData(prev => ({ ...prev, dateIdeas: response.data.dateIdeas }));
                    break;
                case 'compatibility':
                    response = await api.get(`/ai-enhanced/compatibility/${matchId}`);
                    setData(prev => ({ ...prev, compatibility: response.data.compatibility }));
                    break;
                case 'flirtingTips':
                    response = await api.get(`/ai-enhanced/flirting-tips/${matchId}`);
                    setData(prev => ({ ...prev, flirtingTips: response.data.flirtingTips }));
                    break;
                case 'dashboard':
                    response = await api.get(`/ai-enhanced/dashboard/${matchId}`);
                    setData(prev => ({ ...prev, dashboard: response.data.dashboard }));
                    break;
            }
        } catch (error) {
            toast.error('Failed to load AI assistance');
        } finally {
            setLoading(prev => ({ ...prev, [tab]: false }));
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedText(''), 2000);
    };

    const renderContent = () => {
        if (loading[activeTab]) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
            );
        }

        switch (activeTab) {
            case 'suggestions':
                return (
                    <div className="space-y-4">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Chat Suggestions
                        </h3>
                        {data.suggestions.map((suggestion, index) => (
                            <div key={index} className={`p-4 rounded-xl border ${
                                isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                            }`}>
                                <div className="flex items-start justify-between">
                                    <p className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {suggestion}
                                    </p>
                                    <button
                                        onClick={() => copyToClipboard(suggestion)}
                                        className={`ml-3 p-2 rounded-lg transition-colors duration-300 ${
                                            copiedText === suggestion
                                                ? 'bg-green-500 text-white'
                                                : (isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500')
                                        }`}
                                    >
                                        {copiedText === suggestion ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'iceBreakers':
                return (
                    <div className="space-y-4">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Personalized Ice Breakers
                        </h3>
                        {data.iceBreakers.map((iceBreaker, index) => (
                            <div key={index} className={`p-4 rounded-xl border ${
                                isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                            }`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {iceBreaker.message}
                                        </p>
                                        <div className="flex items-center space-x-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {iceBreaker.basedOn}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                                {iceBreaker.tone}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(iceBreaker.message)}
                                        className={`ml-3 p-2 rounded-lg transition-colors duration-300 ${
                                            copiedText === iceBreaker.message
                                                ? 'bg-green-500 text-white'
                                                : (isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500')
                                        }`}
                                    >
                                        {copiedText === iceBreaker.message ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'dateIdeas':
                return (
                    <div className="space-y-4">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Perfect Date Ideas
                        </h3>
                        {data.dateIdeas.map((idea, index) => (
                            <div key={index} className={`p-4 rounded-xl border ${
                                isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                            }`}>
                                <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {idea.title}
                                </h4>
                                <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {idea.description}
                                </p>
                                <div className="flex items-center space-x-4 text-sm">
                                    <span className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <Calendar className="w-4 h-4" />
                                        <span>{idea.duration}</span>
                                    </span>
                                    <span className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <span>💰</span>
                                        <span>{idea.cost}</span>
                                    </span>
                                </div>
                                <div className={`mt-3 p-3 rounded-lg ${
                                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                                }`}>
                                    <p className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                        Why it's perfect:
                                    </p>
                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {idea.whyPerfect}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'compatibility':
                return (
                    <div className="space-y-6">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Compatibility Analysis
                        </h3>
                        {data.compatibility && (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-xl border ${
                                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            Compatibility Score
                                        </span>
                                        <span className={`text-2xl font-bold ${
                                            data.compatibility.score > 80 ? 'text-green-500' :
                                            data.compatibility.score > 60 ? 'text-yellow-500' : 'text-red-500'
                                        }`}>
                                            {data.compatibility.score}%
                                        </span>
                                    </div>
                                    <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                        <div 
                                            className={`h-full rounded-full ${
                                                data.compatibility.score > 80 ? 'bg-green-500' :
                                                data.compatibility.score > 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${data.compatibility.score}%` }}
                                        />
                                    </div>
                                </div>

                                <div className={`p-4 rounded-xl border ${
                                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <h4 className={`font-semibold mb-2 text-green-500`}>Strengths</h4>
                                    <ul className="space-y-1">
                                        {data.compatibility.strengths?.map((strength, index) => (
                                            <li key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                • {strength}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={`p-4 rounded-xl border ${
                                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <h4 className={`font-semibold mb-2 text-yellow-500`}>Challenges</h4>
                                    <ul className="space-y-1">
                                        {data.compatibility.challenges?.map((challenge, index) => (
                                            <li key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                • {challenge}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={`p-4 rounded-xl border ${
                                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <h4 className={`font-semibold mb-2 text-blue-500`}>Recommendations</h4>
                                    <ul className="space-y-1">
                                        {data.compatibility.recommendations?.map((rec, index) => (
                                            <li key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                • {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'flirtingTips':
                return (
                    <div className="space-y-4">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Flirting Tips
                        </h3>
                        {data.flirtingTips.map((tip, index) => (
                            <div key={index} className={`p-4 rounded-xl border ${
                                isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                            }`}>
                                <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {tip.tip}
                                </h4>
                                <div className={`p-3 rounded-lg mb-3 ${
                                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                                }`}>
                                    <p className={`text-sm font-medium mb-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                        Example:
                                    </p>
                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {tip.example}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {tip.timing}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                                    }`}>
                                        {tip.expectedResponse}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            AI Coaching Dashboard
                        </h3>
                        {data.dashboard && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border ${
                                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Conversation Stage
                                    </h4>
                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {data.dashboard.conversationStage}
                                    </p>
                                </div>
                                <div className={`p-4 rounded-xl border ${
                                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Compatibility Score
                                    </h4>
                                    <p className={`text-2xl font-bold ${
                                        data.dashboard.compatibilityScore > 80 ? 'text-green-500' :
                                        data.dashboard.compatibilityScore > 60 ? 'text-yellow-500' : 'text-red-500'
                                    }`}>
                                        {data.dashboard.compatibilityScore}%
                                    </p>
                                </div>
                                <div className={`p-4 rounded-xl border ${
                                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Suggestions Used
                                    </h4>
                                    <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {data.dashboard.suggestionsUsed}/{data.dashboard.totalSuggestions}
                                    </p>
                                </div>
                                <div className={`p-4 rounded-xl border ${
                                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Average Effectiveness
                                    </h4>
                                    <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {data.dashboard.averageEffectiveness?.toFixed(1)}/5
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className={`fixed right-0 top-0 h-full w-96 shadow-2xl z-50 ${
                isDark ? 'bg-gray-900 border-l border-gray-700' : 'bg-white border-l border-gray-200'
            }`}
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white">
                                <Bot className="w-5 h-5" />
                            </div>
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                AI Assistant
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-colors duration-300 ${
                                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className={`flex-shrink-0 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-300 ${
                                        activeTab === tab.id
                                            ? 'border-purple-500 text-purple-600'
                                            : (isDark 
                                                ? 'border-transparent text-gray-400 hover:text-gray-300' 
                                                : 'border-transparent text-gray-500 hover:text-gray-700')
                                    }`}
                                >
                                    <Icon className="w-4 h-4 mx-auto" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {renderContent()}
                </div>
            </div>
        </motion.div>
    );
};

export default AIAssistantPanel;