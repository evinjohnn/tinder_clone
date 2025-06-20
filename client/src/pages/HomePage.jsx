// client/src/pages/HomePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useMatchStore, useAuthStore } from '../store';
import { Loader2, Frown, X, Heart } from 'lucide-react';
import Layout from '../components/Layout';
import ProfileCard from '../components/ProfileCard';
import BottomNavBar from '../components/BottomNavBar';
import { Navigate } from 'react-router-dom';
import { Header } from '../components/Header';

const isProfileComplete = (user) => {
    return user && Array.isArray(user.images) && user.images.length >= 1;
};

const HomePage = () => {
    const { authUser } = useAuthStore();
    // Select state variables for re-renders
    const { isLoading, discoverProfiles } = useMatchStore((state) => ({
        isLoading: state.isLoading,
        discoverProfiles: state.discoverProfiles,
    }));
    
    const [currentIndex, setCurrentIndex] = useState(0);

    // FIX: This useEffect hook is now completely safe.
    useEffect(() => {
        if (authUser && isProfileComplete(authUser)) {
            // Call store actions using the stable getState() method inside the effect
            useMatchStore.getState().getFeeds();
            useMatchStore.getState().subscribeToNewMatches();
        }
        // The return function (cleanup) will run when the component unmounts
        return () => {
            if (authUser) {
                useMatchStore.getState().unsubscribeFromNewMatches();
            }
        };
	}, [authUser]); // Only re-run this effect if `authUser` changes.

    if (!authUser) {
        return <Navigate to="/auth" />;
    }
    
    if (!isProfileComplete(authUser)) {
        return <Navigate to="/profile" />;
    }

    const currentProfile = discoverProfiles[currentIndex];

    const handleAction = (actionType) => {
        if (!currentProfile) return;
        
        if (actionType === 'like') {
            const likedContent = currentProfile.prompts?.[0]?.prompt || 'their profile';
            useMatchStore.getState().sendLike(currentProfile, likedContent);
        }
        
        setCurrentIndex(prevIndex => prevIndex + 1);
    };

    const renderContent = () => {
        // Show loader only if it's the very first load
        if (isLoading && discoverProfiles.length === 0) {
            return <LoadingUI />;
        }
        if (!currentProfile) {
            return <NoMoreProfilesUI />;
        }
        return (
            <>
                <ProfileCard userProfile={currentProfile} />
                <div className="flex items-center justify-center gap-12 mt-6">
                    <button onClick={() => handleAction('reject')} className="action-button border-red-500/50 text-red-500 hover:bg-red-500/20">
                        <X size={32} strokeWidth={3} />
                    </button>
                    <button onClick={() => handleAction('like')} className="action-button border-green-400/50 text-green-400 hover:bg-green-400/20">
                        <Heart size={32} strokeWidth={3} />
                    </button>
                </div>
            </>
        );
    };

    return (
        <Layout>
            <div className="flex flex-col h-screen max-h-screen">
                <Header />
                <div className="flex-grow flex flex-col justify-center items-center p-4 pb-24">
                    {renderContent()}
                </div>
                <BottomNavBar />
            </div>
            <style>{`
                .action-button { padding: 1.25rem; border-radius: 9999px; background-color: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-width: 2px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); transition: all 0.2s ease-in-out; }
                .action-button:hover { transform: scale(1.1); }
            `}</style>
        </Layout>
    );
};

const LoadingUI = () => <div className='flex items-center justify-center h-full'><Loader2 className='text-yellow-400 animate-spin' size={48} /></div>;
const NoMoreProfilesUI = () => (
    <div className='flex flex-col items-center justify-center h-full text-center text-white'>
        <Frown size={64} className="text-zinc-500 mb-4" />
        <h2 className="text-2xl font-bold">That's everyone for now!</h2>
        <p className="text-gray-400 mt-2">Check back later for new profiles.</p>
    </div>
);

export default HomePage;