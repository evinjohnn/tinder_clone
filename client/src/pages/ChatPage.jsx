// client/src/pages/ChatPage.jsx
import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import BottomNavBar from '../components/BottomNavBar';
import { useMatchStore } from '../store';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Loader2 } from 'lucide-react';

const ChatListPage = () => {
    const { matches, isLoading, getFeeds } = useMatchStore();

    useEffect(() => {
        getFeeds();
    }, [getFeeds]);

    return (
        <Layout>
            <div className="flex flex-col h-screen max-h-screen">
                <Header />
                <header className="p-4 border-b border-zinc-700/30">
                    <h1 className="text-2xl font-bold text-white text-center">Messages</h1>
                </header>
                <main className="flex-grow overflow-y-auto p-4 space-y-3 pb-24">
                    {isLoading && <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-white"/></div>}
                    {!isLoading && matches.length === 0 && (
                         <div className="text-center text-gray-400 pt-20">
                            <p>You have no matches yet.</p>
                            <p>Matches will appear here once you have them.</p>
                        </div>
                    )}
                    {!isLoading && matches.map(match => (
                        <Link to={`/chat/${match._id}`} key={match._id} className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors">
                            <img src={match.image || '/avatar.png'} alt={match.name} className="w-14 h-14 rounded-full object-cover"/>
                            <div>
                                <h2 className="text-lg font-semibold text-white">{match.name}</h2>
                                <p className="text-sm text-gray-400">Tap to start chatting...</p>
                            </div>
                        </Link>
                    ))}
                </main>
                <BottomNavBar />
            </div>
        </Layout>
    );
};

export default ChatListPage;