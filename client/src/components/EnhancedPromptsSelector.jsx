// client/src/components/EnhancedPromptsSelector.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const CATEGORY_ICONS = {
    personality: User,
    lifestyle: Heart,
    relationship: MessageCircle
};

const CATEGORY_COLORS = {
    personality: 'from-blue-500 to-purple-500',
    lifestyle: 'from-green-500 to-teal-500',
    relationship: 'from-pink-500 to-rose-500'
};

const EnhancedPromptsSelector = ({ selectedPrompts, onPromptsChange, maxPrompts = 3 }) => {
    const { isDark } = useTheme();
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/prompts/categories');
            setCategories(response.data.categories);
            if (response.data.categories.length > 0) {
                setActiveCategory(response.data.categories[0].name);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchPrompts = async (categoryName) => {
        setLoading(true);
        try {
            const response = await api.get(`/prompts/category/${categoryName}`);
            setPrompts(response.data.prompts);
        } catch (error) {
            console.error('Error fetching prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeCategory) {
            fetchPrompts(activeCategory);
        }
    }, [activeCategory]);

    const handlePromptSelect = (prompt) => {
        if (selectedPrompts.some(p => p.prompt === prompt.text)) {
            // Remove if already selected
            onPromptsChange(selectedPrompts.filter(p => p.prompt !== prompt.text));
        } else if (selectedPrompts.length < maxPrompts) {
            // Add if under limit
            onPromptsChange([...selectedPrompts, { 
                prompt: prompt.text, 
                answer: '',
                category: prompt.category 
            }]);
            
            // Record usage
            recordPromptUsage(activeCategory, prompt.text);
        }
    };

    const recordPromptUsage = async (categoryName, promptText) => {
        try {
            await api.post('/prompts/usage', {
                categoryName,
                promptText
            });
        } catch (error) {
            console.error('Error recording prompt usage:', error);
        }
    };

    const getCategoryIcon = (categoryName) => {
        const Icon = CATEGORY_ICONS[categoryName] || User;
        return <Icon className="w-5 h-5" />;
    };

    const getCategoryColor = (categoryName) => {
        return CATEGORY_COLORS[categoryName] || 'from-gray-500 to-gray-600';
    };

    const isPromptSelected = (prompt) => {
        return selectedPrompts.some(p => p.prompt === prompt.text);
    };

    const getSelectedPromptsCount = () => {
        return selectedPrompts.length;
    };

    const activeCategoryData = categories.find(cat => cat.name === activeCategory);

    return (
        <div className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Choose Your Prompts
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {getSelectedPromptsCount()}/{maxPrompts} selected
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {categories.map((category) => (
                        <button
                            key={category.name}
                            onClick={() => setActiveCategory(category.name)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                                activeCategory === category.name
                                    ? `border-transparent bg-gradient-to-r ${getCategoryColor(category.name)} text-white`
                                    : (isDark 
                                        ? 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500' 
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300')
                            }`}
                        >
                            <div className="flex items-center space-x-3 mb-2">
                                {getCategoryIcon(category.name)}
                                <h4 className="font-semibold">{category.displayName}</h4>
                            </div>
                            <p className={`text-sm ${
                                activeCategory === category.name 
                                    ? 'text-white/80' 
                                    : (isDark ? 'text-gray-400' : 'text-gray-500')
                            }`}>
                                {category.description}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Category Info */}
            {activeCategoryData && (
                <div className={`p-4 rounded-xl border ${
                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                }`}>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryColor(activeCategory)} text-white`}>
                            {getCategoryIcon(activeCategory)}
                        </div>
                        <div>
                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {activeCategoryData.displayName} Prompts
                            </h4>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {activeCategoryData.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Prompts Grid */}
            <div className="space-y-4">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={`p-4 rounded-xl border ${
                                isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                            }`}>
                                <div className="animate-pulse">
                                    <div className={`h-4 rounded mb-2 ${
                                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                                    }`} />
                                    <div className={`h-3 rounded w-3/4 ${
                                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                                    }`} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence mode="wait">
                            {prompts.map((prompt, index) => {
                                const isSelected = isPromptSelected(prompt);
                                const isDisabled = !isSelected && getSelectedPromptsCount() >= maxPrompts;
                                
                                return (
                                    <motion.button
                                        key={prompt.text}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        onClick={() => handlePromptSelect(prompt)}
                                        disabled={isDisabled}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                                            isSelected
                                                ? `border-transparent bg-gradient-to-r ${getCategoryColor(activeCategory)} text-white`
                                                : isDisabled
                                                ? (isDark 
                                                    ? 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed' 
                                                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed')
                                                : (isDark 
                                                    ? 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700' 
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50')
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className={`font-medium ${
                                                    isSelected ? 'text-white' : ''
                                                }`}>
                                                    {prompt.text}
                                                </p>
                                                {prompt.popularity > 0 && (
                                                    <p className={`text-xs mt-1 ${
                                                        isSelected 
                                                            ? 'text-white/70' 
                                                            : (isDark ? 'text-gray-400' : 'text-gray-500')
                                                    }`}>
                                                        Used {prompt.popularity} times
                                                    </p>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <div className="ml-3 p-1 bg-white/20 rounded-full">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Selected Prompts Summary */}
            {selectedPrompts.length > 0 && (
                <div className={`p-4 rounded-xl border ${
                    isDark ? 'border-green-700 bg-green-900/20' : 'border-green-200 bg-green-50'
                }`}>
                    <h4 className={`font-semibold mb-3 ${
                        isDark ? 'text-green-300' : 'text-green-700'
                    }`}>
                        Selected Prompts ({selectedPrompts.length})
                    </h4>
                    <div className="space-y-2">
                        {selectedPrompts.map((prompt, index) => (
                            <div key={prompt.prompt} className={`flex items-center space-x-3 p-2 rounded-lg ${
                                isDark ? 'bg-gray-800' : 'bg-white'
                            }`}>
                                <div className={`p-1 rounded-full bg-gradient-to-r ${getCategoryColor(prompt.category)} text-white`}>
                                    {getCategoryIcon(prompt.category)}
                                </div>
                                <span className={`font-medium ${
                                    isDark ? 'text-white' : 'text-gray-800'
                                }`}>
                                    {prompt.prompt}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedPromptsSelector;