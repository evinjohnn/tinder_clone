// client/src/components/ProfileCard.jsx
import { Heart, Diamond } from 'lucide-react';

const ProfileCard = ({ user, onLike, onRose, isStandout }) => {
    // If for any reason a user object is malformed, we won't render the card.
    if (!user) {
        return null;
    }

    const handleLikeClick = (content) => onLike(user, content);
    const handleRoseClick = (content) => onRose(user, content);

    // FIX: Defensively calculate the score color and provide a default.
    const score = user.reputationScore ?? 70;
    const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';

    // FIX: Use optional chaining (?.) and nullish coalescing (?? []) to prevent crashes.
    // This says "If user.images exists, use it. Otherwise, use an empty array."
    const userImages = user.images ?? [];
    const userPrompts = user.prompts ?? [];

    return (
        <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm mx-auto my-4">
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center text-white">
                    <h2 className="text-2xl font-bold">{user.name}, {user.age}</h2>
                    <div className={`flex items-center gap-1 font-bold ${scoreColor}`}>
                        <span>{score}</span>
                        <span className="text-xs">REP</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {/* Use the safe userImages array */}
                    {userImages.slice(0, 1).map((img, i) => (
                        <div key={`img-${i}`} className="relative group col-span-2 aspect-w-1 aspect-h-1 bg-zinc-800 rounded-lg">
                            <img src={img} className="w-full h-full object-cover rounded-lg" alt={`${user.name}-img-${i}`} />
                             <LikeButton onClick={() => handleLikeClick(`Photo #${i + 1}`)} isStandout={isStandout} onRoseClick={() => handleRoseClick(`Photo #${i + 1}`)} />
                        </div>
                    ))}
                    {userImages.slice(1).map((img, i) => (
                        <div key={`img-${i+1}`} className="relative group aspect-w-1 aspect-h-1 bg-zinc-800 rounded-lg">
                            <img src={img} className="w-full h-full object-cover rounded-lg" alt={`${user.name}-img-${i+1}`} />
                             <LikeButton onClick={() => handleLikeClick(`Photo #${i + 2}`)} isStandout={isStandout} onRoseClick={() => handleRoseClick(`Photo #${i + 2}`)} />
                        </div>
                    ))}
                </div>
                
                {/* Use the safe userPrompts array */}
                {userPrompts.map((p, i) => (
                    <div key={`prompt-${i}`} className="relative group bg-zinc-800 p-4 rounded-lg">
                        <p className="font-semibold text-gray-300">{p.prompt}</p>
                        <p className="text-lg text-white mt-1">{p.answer}</p>
                        <LikeButton onClick={() => handleLikeClick(`Prompt: ${p.prompt}`)} isStandout={isStandout} onRoseClick={() => handleRoseClick(`Prompt: ${p.prompt}`)} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const LikeButton = ({ onClick, isStandout, onRoseClick }) => (
    <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {isStandout ? (
            <button onClick={onRoseClick} className="bg-cyan-500/80 backdrop-blur-sm p-2 rounded-full text-white hover:scale-110 transition-all">
                <Diamond size={24} />
            </button>
        ) : (
            <button onClick={onClick} className="bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:text-red-500 hover:scale-110 transition-all">
                <Heart size={24} />
            </button>
        )}
    </div>
);

export default ProfileCard;