// client/src/pages/LikesYouPage.jsx
import { useEffect } from 'react';
import { useMatchStore } from '../store';
import Layout from '../components/Layout';
import { Header } from '../components/Header';
import { Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LikesYouPage = () => {
    // The getFeeds function is now the single source of truth for fetching this data
    const { incomingLikes, getFeeds, isLoading } = useMatchStore();

    useEffect(() => {
        getFeeds();
    }, [getFeeds]);

    return (
        <Layout>
            <Header />
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className='flex items-center justify-between mb-6'>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Heart className="text-red-500" />
                        Likes You
                    </h2>
                    <Link to="/" className='text-yellow-400 hover:underline'>Back to Discover</Link>
                </div>
                {isLoading && <Loader2 className="animate-spin text-white mx-auto" />}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!isLoading && incomingLikes.map(like => (
                        <LikeCard key={like._id} like={like} />
                    ))}
                </div>
            </div>
        </Layout>
    );
};

const LikeCard = ({ like }) => {
    const { sendLike } = useMatchStore();

    const handleMatch = () => {
        // FIX: Robustly find the first piece of content to like back
        const firstImage = like.sender.images?.[0];
        const firstPrompt = like.sender.prompts?.[0]?.prompt;
        const contentToLikeBack = firstImage ? `Photo #1` : `Prompt: ${firstPrompt}`;
        
        sendLike(like.sender, contentToLikeBack);
    };

    return (
        <div className="bg-zinc-800/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-zinc-700">
            <img src={like.sender.images?.[0] || '/avatar.png'} alt={like.sender.name} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h3 className="text-xl font-bold text-white">{like.sender.name}, {like.sender.age}</h3>
                <p className="text-sm text-gray-400 mt-2">Liked your {like.likedContent.toLowerCase()}</p>
                {like.comment && <p className="mt-2 p-2 bg-zinc-700 rounded-lg text-white italic">"{like.comment}"</p>}
                
                <div className="mt-4 flex gap-4">
                    <button className="w-full py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition">Pass</button>
                    <button onClick={handleMatch} className="w-full py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:opacity-90 transition">Match</button>
                </div>
            </div>
        </div>
    );
};

export default LikesYouPage;