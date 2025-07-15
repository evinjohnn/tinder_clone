// client/src/pages/EnhancedOnboardingPage.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Camera, Plus, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Components
import Layout from '../components/Layout';
import EnhancedPromptsSelector from '../components/EnhancedPromptsSelector';

// Store
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../context/ThemeContext';

const ONBOARDING_STEPS = [
    'photos',
    'prompts',
    'questionnaire',
    'preferences'
];

const INTERESTS_OPTIONS = [
    'Travel', 'Cooking', 'Music', 'Movies', 'Books', 'Fitness', 'Art', 'Photography',
    'Dancing', 'Gaming', 'Sports', 'Hiking', 'Yoga', 'Wine', 'Coffee', 'Fashion',
    'Technology', 'Politics', 'Science', 'History', 'Languages', 'Volunteering',
    'Entrepreneurship', 'Writing', 'Theater', 'Comedy', 'Festivals', 'Meditation'
];

const EnhancedOnboardingPage = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { authUser, setAuthUser } = useAuthStore();
    const { updateProfile, loading } = useUserStore();
    const fileInputRef = useRef(null);

    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        images: authUser?.images || [],
        prompts: authUser?.prompts || [],
        questionnaire: authUser?.questionnaire || {},
        preferences: {
            ageRange: authUser?.ageRange || { min: 22, max: 35 },
            maxDistance: authUser?.maxDistance || 25
        }
    });

    const currentStepName = ONBOARDING_STEPS[currentStep];
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

    const handleNext = () => {
        if (validateCurrentStep()) {
            if (isLastStep) {
                handleFinish();
            } else {
                setCurrentStep(prev => prev + 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const validateCurrentStep = () => {
        switch (currentStepName) {
            case 'photos':
                if (formData.images.length < 3) {
                    toast.error('Please add at least 3 photos');
                    return false;
                }
                break;
            case 'prompts':
                if (formData.prompts.length < 3 || formData.prompts.some(p => !p.answer.trim())) {
                    toast.error('Please complete all 3 prompts');
                    return false;
                }
                break;
            case 'questionnaire':
                const required = ['relationshipGoals', 'drinkingHabits', 'smokingHabits'];
                if (!required.every(field => formData.questionnaire[field])) {
                    toast.error('Please complete all required fields');
                    return false;
                }
                break;
        }
        return true;
    };

    const handleFinish = async () => {
        try {
            const success = await updateProfile({
                ...authUser,
                ...formData
            });
            
            if (success) {
                setAuthUser({ ...authUser, ...formData });
                toast.success('Profile completed! Welcome to Hinge!');
                navigate('/');
            }
        } catch (error) {
            toast.error('Failed to complete profile');
        }
    };

    const handleImageUpload = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remainingSlots = 6 - formData.images.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const stepProgress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

    return (
        <Layout>
            <div className="min-h-screen flex flex-col">
                {/* Header with Progress */}
                <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className={`p-2 rounded-full transition-colors duration-300 ${
                                currentStep === 0
                                    ? (isDark ? 'text-gray-600' : 'text-gray-400')
                                    : (isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')
                            }`}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        
                        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Complete Your Profile
                        </h1>
                        
                        <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {currentStep + 1} of {ONBOARDING_STEPS.length}
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <motion.div
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${stepProgress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentStepName === 'photos' && (
                                <PhotosStep
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleImageUpload={handleImageUpload}
                                    removeImage={removeImage}
                                    fileInputRef={fileInputRef}
                                />
                            )}
                            
                            {currentStepName === 'prompts' && (
                                <EnhancedPromptsStep
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            )}
                            
                            {currentStepName === 'questionnaire' && (
                                <QuestionnaireStep
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            )}
                            
                            {currentStepName === 'preferences' && (
                                <PreferencesStep
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold text-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : isLastStep ? (
                            'Complete Profile'
                        ) : (
                            'Continue'
                        )}
                    </motion.button>
                </div>
            </div>
        </Layout>
    );
};

// Photos Step Component (same as before)
const PhotosStep = ({ formData, setFormData, handleImageUpload, removeImage, fileInputRef }) => {
    const { isDark } = useTheme();
    
    return (
        <div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Add Your Photos
            </h2>
            <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose photos that show your personality. You need at least 3 photos.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {formData.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                        <img
                            src={image}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-2xl"
                        />
                        <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors duration-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded-full text-white text-xs font-medium">
                                Main Photo
                            </div>
                        )}
                    </div>
                ))}
                
                {formData.images.length < 6 && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                            isDark 
                                ? 'border-gray-600 hover:border-pink-400 text-gray-400 hover:text-pink-400' 
                                : 'border-gray-300 hover:border-pink-500 text-gray-500 hover:text-pink-500'
                        }`}
                    >
                        <Plus className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Add Photo</span>
                    </button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
            />

            <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>Photo Tips:</strong> Use recent photos that clearly show your face. 
                    Avoid group photos, sunglasses, and heavily filtered images.
                </p>
            </div>
        </div>
    );
};

// Enhanced Prompts Step Component
const EnhancedPromptsStep = ({ formData, setFormData }) => {
    const { isDark } = useTheme();
    
    const handlePromptsChange = (newPrompts) => {
        setFormData(prev => ({
            ...prev,
            prompts: newPrompts
        }));
    };

    const updatePromptAnswer = (index, answer) => {
        setFormData(prev => ({
            ...prev,
            prompts: prev.prompts.map((p, i) => 
                i === index ? { ...p, answer } : p
            )
        }));
    };

    return (
        <div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Choose Your Prompts
            </h2>
            <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Select prompts from different categories to show your personality, lifestyle, and relationship goals.
            </p>

            <div className="space-y-8">
                {/* Enhanced Prompts Selector */}
                <EnhancedPromptsSelector
                    selectedPrompts={formData.prompts}
                    onPromptsChange={handlePromptsChange}
                    maxPrompts={3}
                />

                {/* Answer Section */}
                {formData.prompts.length > 0 && (
                    <div className="space-y-6">
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Answer Your Prompts
                        </h3>
                        {formData.prompts.map((prompt, index) => (
                            <div key={index} className={`p-4 rounded-2xl border ${
                                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                                <h4 className={`font-semibold mb-3 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>
                                    {prompt.prompt}
                                </h4>
                                <textarea
                                    value={prompt.answer}
                                    onChange={(e) => updatePromptAnswer(index, e.target.value)}
                                    placeholder="Your answer..."
                                    maxLength={150}
                                    className={`w-full p-3 rounded-xl border resize-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                        isDark 
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                            : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                                    }`}
                                    rows={3}
                                />
                                <div className={`text-xs mt-2 text-right ${
                                    prompt.answer.length > 140 ? 'text-red-500' : (isDark ? 'text-gray-400' : 'text-gray-500')
                                }`}>
                                    {prompt.answer.length}/150
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Questionnaire Step Component (same as before but condensed)
const QuestionnaireStep = ({ formData, setFormData }) => {
    const { isDark } = useTheme();
    
    const updateQuestionnaire = (field, value) => {
        setFormData(prev => ({
            ...prev,
            questionnaire: {
                ...prev.questionnaire,
                [field]: value
            }
        }));
    };

    const essentialQuestions = [
        {
            field: 'relationshipGoals',
            label: 'What are you looking for?',
            options: ['casual', 'serious', 'marriage', 'unsure'],
            required: true
        },
        {
            field: 'drinkingHabits',
            label: 'Do you drink?',
            options: ['never', 'rarely', 'socially', 'regularly'],
            required: true
        },
        {
            field: 'smokingHabits',
            label: 'Do you smoke?',
            options: ['never', 'rarely', 'socially', 'regularly'],
            required: true
        },
        {
            field: 'fitnessLevel',
            label: 'How often do you work out?',
            options: ['never', 'rarely', 'sometimes', 'often', 'daily']
        },
        {
            field: 'wantsChildren',
            label: 'Do you want children?',
            options: ['yes', 'no', 'maybe']
        }
    ];

    return (
        <div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Tell Us About Yourself
            </h2>
            <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Help us find your perfect matches with these essential questions.
            </p>

            <div className="space-y-6">
                {essentialQuestions.map((question) => (
                    <div key={question.field}>
                        <label className={`block font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {question.label} {question.required && '*'}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {question.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => updateQuestionnaire(question.field, option)}
                                    className={`p-3 rounded-xl border transition-all duration-300 ${
                                        formData.questionnaire[question.field] === option
                                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300'
                                            : (isDark 
                                                ? 'border-gray-600 text-gray-300 hover:border-gray-500' 
                                                : 'border-gray-300 text-gray-700 hover:border-gray-400')
                                    }`}
                                >
                                    {option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Preferences Step Component (same as before)
const PreferencesStep = ({ formData, setFormData }) => {
    const { isDark } = useTheme();
    
    const updatePreferences = (field, value) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [field]: value
            }
        }));
    };

    return (
        <div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Set Your Preferences
            </h2>
            <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Help us show you the most compatible matches.
            </p>

            <div className="space-y-8">
                {/* Age Range */}
                <div>
                    <label className={`block font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Age Range: {formData.preferences.ageRange.min} - {formData.preferences.ageRange.max}
                    </label>
                    <div className="space-y-4">
                        <div>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Minimum Age</span>
                            <input
                                type="range"
                                min="18"
                                max="50"
                                value={formData.preferences.ageRange.min}
                                onChange={(e) => updatePreferences('ageRange', {
                                    ...formData.preferences.ageRange,
                                    min: parseInt(e.target.value)
                                })}
                                className="w-full mt-2"
                            />
                        </div>
                        <div>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Maximum Age</span>
                            <input
                                type="range"
                                min="18"
                                max="50"
                                value={formData.preferences.ageRange.max}
                                onChange={(e) => updatePreferences('ageRange', {
                                    ...formData.preferences.ageRange,
                                    max: parseInt(e.target.value)
                                })}
                                className="w-full mt-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Distance */}
                <div>
                    <label className={`block font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Maximum Distance: {formData.preferences.maxDistance} miles
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={formData.preferences.maxDistance}
                        onChange={(e) => updatePreferences('maxDistance', parseInt(e.target.value))}
                        className="w-full"
                    />
                </div>
            </div>

            <div className={`mt-8 p-4 rounded-xl ${
                isDark ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
            }`}>
                <div className="flex items-center space-x-2">
                    <Check className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    <p className={`font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                        You're all set! Let's find your perfect matches.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EnhancedOnboardingPage;