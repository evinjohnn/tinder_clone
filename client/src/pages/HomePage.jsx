// client/src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Header } from "../components/Header";
import { useMatchStore, useAuthStore } from "../store";
import { Loader2, Diamond } from "lucide-react";
import Layout from "../components/Layout";
import ProfileCard from "../components/ProfileCard";
import { Navigate } from "react-router-dom"; // NEW: Import Navigate

// NEW: Helper function to check if profile is complete
const isProfileComplete = (user) => {
    return user && user.images && user.images.length >= 6 && user.prompts && user.prompts.length >= 3;
};

const HomePage = () => {
    const [activeTab, setActiveTab] = useState('discover');
    const { isLoading, getFeeds, discoverProfiles, standoutProfiles, sendLike } = useMatchStore();
	const { authUser } = useAuthStore();

    // NEW: Profile completion guard
    if (authUser && !isProfileComplete(authUser)) {
        return <Navigate to="/profile" />;
    }

	useEffect(() => {
        getFeeds();
	}, [getFeeds]);
	
	const handleLike = (user, likedContent, comment) => sendLike(user, likedContent, comment, false);
    const handleRose = (user, likedContent, comment) => sendLike(user, likedContent, comment, true);
    const profilesToShow = activeTab === 'discover' ? discoverProfiles : standoutProfiles;

	return (
		<Layout>
			<div className='flex h-screen'>
				<Sidebar />
				<div className='flex-grow flex flex-col'>
					<Header />
                    <div className="flex justify-center p-2 bg-black/20 backdrop-blur-sm">
                        <div className="bg-zinc-800 p-1 rounded-full flex items-center">
                            <TabButton isActive={activeTab === 'discover'} onClick={() => setActiveTab('discover')}>Discover</TabButton>
                            <TabButton isActive={activeTab === 'standouts'} onClick={() => setActiveTab('standouts')}>
                                <Diamond size={16} className="text-cyan-400 mr-1"/>Standouts
                            </TabButton>
                        </div>
                    </div>
					<main className='flex-grow overflow-y-auto p-4'>
						<div className="flex flex-col items-center">
							{isLoading && <LoadingUI />}
							{!isLoading && profilesToShow.length > 0 &&
								profilesToShow.map(user => (
									<ProfileCard 
                                        key={user._id} 
                                        user={user} 
                                        onLike={handleLike} 
                                        onRose={handleRose}
                                        isStandout={activeTab === 'standouts'}
                                    />
								))
							}
						</div>
					</main>
				</div>
			</div>
		</Layout>
	);
};

const TabButton = ({ isActive, onClick, children }) => (
    <button onClick={onClick} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${isActive ? 'bg-yellow-400 text-black' : 'text-gray-300 hover:bg-zinc-700'}`}>
        <span className="flex items-center">{children}</span>
    </button>
);

const LoadingUI = () => (
	<div className='flex items-center justify-center h-[calc(100vh-12rem)]'>
		<Loader2 className='text-yellow-400 animate-spin' size={48} />
	</div>
);

export default HomePage;