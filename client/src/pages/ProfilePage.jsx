// client/src/pages/ProfilePage.jsx
import React, { useRef, useState, useEffect } from "react";
import { Header } from "../components/Header";
import { useAuthStore, useUserStore } from "../store";
import { Camera, Loader2, Plus, X } from "lucide-react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PROMPT_CHOICES = [
    "I'm looking for...", "A shower thought I recently had...", "I get way too competitive about...", "My most controversial opinion is...", "The way to win me over is...", "I'm weirdly attracted to...", "My simple pleasures...", "Two truths and a lie...", "I go crazy for...",
];

const ProfilePage = () => {
    const { authUser } = useAuthStore();
    const { loading, updateProfile } = useUserStore();
    const fileInputRef = useRef(null); // A single ref is enough now
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: authUser?.name || "",
        age: authUser?.age || "",
        job: authUser?.job || "",
        school: authUser?.school || "",
        images: authUser?.images || [],
        prompts: authUser?.prompts || [],
    });

    useEffect(() => {
        if (authUser) {
            setFormData({
                name: authUser.name || "",
                age: authUser.age || "",
                job: authUser.job || "",
                school: authUser.school || "",
                images: authUser.images || [],
                prompts: authUser.prompts || [],
            });
        }
    }, [authUser]);

    const handleImageChange = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Ensure we don't exceed 6 images total
        const remainingSlots = 6 - formData.images.length;
        if (files.length > remainingSlots) {
            toast.error(`You can only add ${remainingSlots} more photo(s).`);
        }
        
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result],
                }));
            };
            reader.readAsDataURL(file);
        });
    };
    
    const removeImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handlePromptChange = (index, field, value) => {
        const newPrompts = [...formData.prompts];
        newPrompts[index][field] = value;
        setFormData({ ...formData, prompts: newPrompts });
    };

    const addPrompt = () => {
        if (formData.prompts.length < 3) {
            setFormData(prev => ({...prev, prompts: [...prev.prompts, { prompt: '', answer: '' }]}));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.images.length < 6) return toast.error("Please upload all 6 photos.");
        if (formData.prompts.length < 3 || formData.prompts.some(p => !p.answer.trim())) return toast.error("Please answer all 3 prompts.");

        const success = await updateProfile(formData);
        if (success) {
            navigate("/");
        }
    };

    return (
        <Layout>
            <Header />
            <div className="max-w-2xl mx-auto py-12 px-4">
                <h2 className="text-center text-3xl font-bold text-yellow-400 mb-2">Complete Your Profile</h2>
                <p className="text-center text-gray-400 mb-8">A great profile is the first step to a great match.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Photos Section with Multi-upload */}
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Your Photos ({formData.images.length}/6)</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {formData.images.map((image, index) => (
                                <div key={index} className="relative aspect-square bg-zinc-800 rounded-lg">
                                    <img src={image} alt={`Profile ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-red-500">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {formData.images.length < 6 && (
                                <div onClick={() => fileInputRef.current?.click()} className="relative aspect-square bg-zinc-800 rounded-lg flex items-center justify-center border-2 border-dashed border-zinc-600 hover:border-yellow-400 cursor-pointer">
                                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} multiple onChange={handleImageChange} />
                                    <Plus className="text-zinc-500" size={32} />
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Other form sections remain the same */}
                    {/* ... */}
                </form>
            </div>
        </Layout>
    );
};

export default ProfilePage; // Ensure other components like InputField are still here or refactored