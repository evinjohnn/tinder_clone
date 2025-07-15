// client/src/components/AdvancedFiltersModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Sliders, Star, MapPin, Clock, Shield, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdvancedFiltersModal = ({ isOpen, onClose, onFiltersApplied }) => {
    const { isDark } = useTheme();
    const [filterOptions, setFilterOptions] = useState(null);
    const [savedFilters, setSavedFilters] = useState({});
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFilterOptions();
        }
    }, [isOpen]);

    const fetchFilterOptions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/filters');
            setFilterOptions(response.data.filterOptions);
            setSavedFilters(response.data.savedFilters || {});
            setFilters(response.data.savedFilters || {});
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error('Premium feature - Upgrade to use advanced filters');
            } else {
                toast.error('Failed to load filters');
            }
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        setApplying(true);
        try {
            const response = await api.post('/filters/apply', { filters });
            onFiltersApplied(response.data.matches);
            toast.success(`Found ${response.data.totalMatches} matches with your filters`);
            onClose();
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error('Premium feature - Upgrade to use advanced filters');
            } else {
                toast.error('Failed to apply filters');
            }
        } finally {
            setApplying(false);
        }
    };

    const clearFilters = async () => {
        try {
            await api.delete('/filters/clear');
            setFilters({});
            toast.success('Filters cleared');
        } catch (error) {
            toast.error('Failed to clear filters');
        }
    };

    const updateFilter = (category, field, value) => {
        setFilters(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const updateArrayFilter = (category, field, value, checked) => {
        setFilters(prev => {
            const currentArray = prev[category]?.[field] || [];
            const newArray = checked
                ? [...currentArray, value]
                : currentArray.filter(item => item !== value);
            
            return {
                ...prev,
                [category]: {
                    ...prev[category],
                    [field]: newArray
                }
            };
        });
    };

    const getFilterCount = () => {
        let count = 0;
        Object.values(filters).forEach(category => {
            Object.values(category || {}).forEach(value => {
                if (Array.isArray(value)) {
                    count += value.length;
                } else if (value !== undefined && value !== null && value !== '') {
                    count += 1;
                }
            });
        });
        return count;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-xl ${
                        isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                >
                    {/* Header */}
                    <div className={`sticky top-0 z-10 p-6 border-b ${
                        isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white">
                                    <Filter className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Advanced Filters
                                    </h2>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Find your perfect matches with precision
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {getFilterCount() > 0 && (
                                    <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium">
                                        {getFilterCount()} filters active
                                    </div>
                                )}
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-full transition-colors duration-300 ${
                                        isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                                    }`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="animate-pulse">
                                        <div className={`h-6 rounded mb-4 ${
                                            isDark ? 'bg-gray-700' : 'bg-gray-200'
                                        }`} />
                                        <div className="grid grid-cols-3 gap-4">
                                            {[1, 2, 3].map(j => (
                                                <div key={j} className={`h-12 rounded ${
                                                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                                                }`} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filterOptions ? (
                            <div className="space-y-8">
                                {/* Demographics */}
                                <div>
                                    <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
                                        isDark ? 'text-white' : 'text-gray-800'
                                    }`}>
                                        <Star className="w-5 h-5 text-yellow-500" />
                                        <span>Demographics</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Age Range */}
                                        <div>
                                            <label className={`block font-medium mb-3 ${
                                                isDark ? 'text-white' : 'text-gray-700'
                                            }`}>
                                                Age Range: {filters.ageRange?.min || 18} - {filters.ageRange?.max || 99}
                                            </label>
                                            <div className="space-y-3">
                                                <div>
                                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Min Age
                                                    </span>
                                                    <input
                                                        type="range"
                                                        min="18"
                                                        max="70"
                                                        value={filters.ageRange?.min || 18}
                                                        onChange={(e) => updateFilter('ageRange', 'min', parseInt(e.target.value))}
                                                        className="w-full mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Max Age
                                                    </span>
                                                    <input
                                                        type="range"
                                                        min="18"
                                                        max="70"
                                                        value={filters.ageRange?.max || 99}
                                                        onChange={(e) => updateFilter('ageRange', 'max', parseInt(e.target.value))}
                                                        className="w-full mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Height */}
                                        <div>
                                            <label className={`block font-medium mb-3 ${
                                                isDark ? 'text-white' : 'text-gray-700'
                                            }`}>
                                                Height Range
                                            </label>
                                            <div className="space-y-3">
                                                <div>
                                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Min Height (inches)
                                                    </span>
                                                    <input
                                                        type="range"
                                                        min="48"
                                                        max="84"
                                                        value={filters.height?.min || 48}
                                                        onChange={(e) => updateFilter('height', 'min', parseInt(e.target.value))}
                                                        className="w-full mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Max Height (inches)
                                                    </span>
                                                    <input
                                                        type="range"
                                                        min="48"
                                                        max="84"
                                                        value={filters.height?.max || 84}
                                                        onChange={(e) => updateFilter('height', 'max', parseInt(e.target.value))}
                                                        className="w-full mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Lifestyle */}
                                <div>
                                    <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
                                        isDark ? 'text-white' : 'text-gray-800'
                                    }`}>
                                        <Heart className="w-5 h-5 text-red-500" />
                                        <span>Lifestyle</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(filterOptions.lifestyle || {}).map(([key, options]) => (
                                            <div key={key}>
                                                <label className={`block font-medium mb-3 ${
                                                    isDark ? 'text-white' : 'text-gray-700'
                                                }`}>
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {options.map(option => (
                                                        <label key={option} className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={filters.lifestyle?.[key]?.includes(option) || false}
                                                                onChange={(e) => updateArrayFilter('lifestyle', key, option, e.target.checked)}
                                                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                            />
                                                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                {option.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Interests */}
                                <div>
                                    <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
                                        isDark ? 'text-white' : 'text-gray-800'
                                    }`}>
                                        <Sliders className="w-5 h-5 text-blue-500" />
                                        <span>Interests</span>
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {filterOptions.interests?.map(interest => (
                                            <label key={interest} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.interests?.includes(interest) || false}
                                                    onChange={(e) => updateArrayFilter('', 'interests', interest, e.target.checked)}
                                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                />
                                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {interest}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Quality Filters */}
                                <div>
                                    <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
                                        isDark ? 'text-white' : 'text-gray-800'
                                    }`}>
                                        <Shield className="w-5 h-5 text-green-500" />
                                        <span>Quality & Safety</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={`block font-medium mb-3 ${
                                                isDark ? 'text-white' : 'text-gray-700'
                                            }`}>
                                                Minimum Credibility Score: {filters.minCredibilityScore || 0}
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={filters.minCredibilityScore || 0}
                                                onChange={(e) => updateFilter('', 'minCredibilityScore', parseInt(e.target.value))}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block font-medium mb-3 ${
                                                isDark ? 'text-white' : 'text-gray-700'
                                            }`}>
                                                Minimum Behavior Index: {filters.minBehaviorIndex || 0}
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={filters.minBehaviorIndex || 0}
                                                onChange={(e) => updateFilter('', 'minBehaviorIndex', parseInt(e.target.value))}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={filters.verifiedOnly || false}
                                                onChange={(e) => updateFilter('', 'verifiedOnly', e.target.checked)}
                                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Verified profiles only
                                            </span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={filters.photoVerifiedOnly || false}
                                                onChange={(e) => updateFilter('', 'photoVerifiedOnly', e.target.checked)}
                                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Photo verified only
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer */}
                    <div className={`sticky bottom-0 p-6 border-t ${
                        isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
                    }`}>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={clearFilters}
                                className={`px-4 py-2 rounded-xl transition-colors duration-300 ${
                                    isDark 
                                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                            >
                                Clear All
                            </button>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={onClose}
                                    className={`px-6 py-3 rounded-xl font-medium transition-colors duration-300 ${
                                        isDark 
                                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyFilters}
                                    disabled={applying}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50"
                                >
                                    {applying ? 'Applying...' : 'Apply Filters'}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdvancedFiltersModal;