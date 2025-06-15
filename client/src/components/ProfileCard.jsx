// client/src/components/ProfileCard.jsx
import React from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';

const ProfileCard = ({ userProfile }) => {
    if (!userProfile) {
        return null;
    }

    const { name = "User", age = "N/A", images = [], job = "", school = "", prompts = [] } = userProfile;
    const mainImage = images[0] || '/avatar.png';

    return (
        <div className="relative w-full h-full max-w-md mx-auto aspect-[9/16] rounded-2xl shadow-2xl overflow-hidden bg-zinc-800">
            <img src={mainImage} alt={name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h1 className="text-4xl font-bold drop-shadow-lg">{name}, {age}</h1>
                <div className="mt-2 space-y-1 text-base text-gray-200">
                    {job && (
                        <div className="flex items-center gap-2">
                            <Briefcase size={16} />
                            <span>{job}</span>
                        </div>
                    )}
                    {school && (
                        <div className="flex items-center gap-2">
                            <GraduationCap size={16} />
                            <span>{school}</span>
                        </div>
                    )}
                </div>
                {prompts.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg">
                           <p className="font-semibold text-gray-300">{prompts[0].prompt}</p>
                           <p className="text-lg text-white mt-1 line-clamp-2">{prompts[0].answer}</p>
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export default ProfileCard;