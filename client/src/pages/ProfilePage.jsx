// client/src/pages/ProfilePage.jsx
import { useRef, useState, useEffect } from "react";
import { Header } from "../components/Header";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import { Camera, Loader2, Plus, X } from "lucide-react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // Make sure toast is imported

const PROMPT_CHOICES = [
    "I'm looking for...", "A shower thought I recently had...", "I get way too competitive about...", "My most controversial opinion is...", "The way to win me over is...", "I'm weirdly attracted to...", "My simple pleasures...", "Two truths and a lie...", "I go crazy for...",
];

const ProfilePage = () => {
    const { authUser } = useAuthStore();
    const { loading, updateProfile } = useUserStore();
    const fileInputRefs = useRef([]); // FIX: Use an array for refs
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: authUser?.name || "",
        age: authUser?.age || "",
        job: authUser?.job || "",
        school: authUser?.school || "",
        images: authUser?.images || Array(6).fill(null),
        prompts: authUser?.prompts || [],
    });

    useEffect(() => {
        setFormData({
            name: authUser?.name || "",
            age: authUser?.age || "",
            job: authUser?.job || "",
            school: authUser?.school || "",
            images: authUser?.images && authUser.images.length > 0 ? authUser.images.concat(Array(6 - authUser.images.length).fill(null)) : Array(6).fill(null),
            prompts: authUser?.prompts || [],
        });
    }, [authUser]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImages = [...formData.images];
                newImages[index] = reader.result;
                setFormData({ ...formData, images: newImages });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handlePromptChange = (index, field, value) => {
        const newPrompts = [...formData.prompts];
        newPrompts[index][field] = value;
        setFormData({ ...formData, prompts: newPrompts });
    };
    
    const addPrompt = () => {
        if(formData.prompts.length < 3) {
            setFormData({...formData, prompts: [...formData.prompts, { prompt: '', answer: ''}]});
        }
    };

    const removePrompt = (index) => {
        const newPrompts = formData.prompts.filter((_, i) => i !== index);
        setFormData({...formData, prompts: newPrompts});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const filledImages = formData.images.filter(img => img !== null);
        if (filledImages.length < 6) {
            toast.error("Please upload all 6 photos.");
            return;
        }
        if (formData.prompts.length < 3 || formData.prompts.some(p => !p.answer.trim())) {
            toast.error("Please answer all 3 prompts.");
            return;
        }

        const profileData = {
            ...formData,
            images: filledImages
        }
        
        const success = await updateProfile(profileData);

        if (success) {
            navigate("/");
        }
    };

    return (
        <Layout>
            <Header />
            <div className="max-w-2xl mx-auto py-12 px-4">
                <h2 className="text-center text-3xl font-bold text-yellow-400 mb-2">
                    Complete Your Profile
                </h2>
                <p className="text-center text-gray-400 mb-8">A great profile is the first step to a great match.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Your Photos (6 required)</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {formData.images.map((image, index) => (
                                <div key={index} className="relative aspect-square bg-zinc-800 rounded-lg flex items-center justify-center border-2 border-dashed border-zinc-600">
                                    {/* FIX: Correctly manage multiple file inputs */}
                                    <input type="file" accept="image/*" className="hidden" ref={el => fileInputRefs.current[index] = el} onChange={(e) => handleImageChange(e, index)} />
                                    {image ? (
                                        <img src={image} alt={`Profile ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <Plus className="text-zinc-500" size={32} />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer rounded-lg transition-opacity" onClick={() => fileInputRefs.current[index]?.click()}>
                                        <Camera className="text-white" size={32} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                         <h3 className="text-xl font-semibold text-white mb-4">Your Details</h3>
                        <InputField label="Name" name="name" value={formData.name} onChange={handleInputChange} />
                        <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleInputChange} />
                        <InputField label="Job" name="job" value={formData.job} onChange={handleInputChange} placeholder="e.g., Software Engineer"/>
                        <InputField label="School" name="school" value={formData.school} onChange={handleInputChange} placeholder="e.g., University of Example"/>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Your Prompts (3 required)</h3>
                         <div className="space-y-4">
                            {formData.prompts.map((p, index) => (
                                <div key={index} className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <select value={p.prompt} onChange={(e) => handlePromptChange(index, 'prompt', e.target.value)} className="bg-transparent text-yellow-400 font-semibold focus:outline-none w-full">
                                            <option value="">Select a prompt...</option>
                                            {PROMPT_CHOICES.map(choice => (
                                                <option key={choice} value={choice} className="bg-zinc-800">{choice}</option>
                                            ))}
                                        </select>
                                        <button type="button" onClick={() => removePrompt(index)}><X size={16} className="text-gray-400 hover:text-white"/></button>
                                    </div>
                                    <textarea value={p.answer} onChange={(e) => handlePromptChange(index, 'answer', e.target.value)} rows={3} className="w-full bg-zinc-700/50 p-2 rounded text-white resize-none focus:outline-none focus:ring-1 focus:ring-yellow-400" placeholder="Your answer..."/>
                                </div>
                            ))}
                            {formData.prompts.length < 3 && (
                                <button type="button" onClick={addPrompt} className="w-full py-2 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:border-yellow-400 hover:text-yellow-400 transition">Add a Prompt</button>
                            )}
                         </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl text-black font-semibold shadow-lg hover:from-yellow-500 hover:to-yellow-600 transition-all disabled:opacity-50">
                        {loading ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : 'Save and Start Matching'}
                    </button>
                </form>
            </div>
        </Layout>
    );
};

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input {...props} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
    </div>
);

export default ProfilePage;