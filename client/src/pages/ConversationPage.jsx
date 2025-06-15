// client/src/pages/ConversationPage.jsx
import { useEffect, useRef } from "react";
import { useAuthStore, useMatchStore, useMessageStore } from "../store";
import { Link, useParams } from "react-router-dom";
import { Loader2, UserX, Phone, ChevronLeft, Video as VideoCamera } from "lucide-react";
import MessageInput from "../components/MessageInput";
import Layout from "../components/Layout";

const ConversationPage = () => {
	const { id } = useParams();
	const messagesEndRef = useRef(null);
    const { getFeeds } = useMatchStore.getState();

	const { match } = useMatchStore((state) => ({
		match: state.matches.find((m) => m._id === id),
	}));

	const { messages, getMessages, subscribeToMessages, unsubscribeFromMessages, loading } = useMessageStore();
	const { authUser } = useAuthStore();

    useEffect(() => {
        // If we don't have the match data, fetch everything
        if (!match) {
            getFeeds();
        }
    }, [id, match, getFeeds]);

	useEffect(() => {
		if (id) {
			getMessages(id);
			subscribeToMessages();
		}
		return () => {
			unsubscribeFromMessages();
		};
	}, [id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	if (loading) return <LoadingMessagesUI />;
    if (!match) return <MatchNotFound />;

	return (
        <Layout>
            <div className="flex flex-col h-screen bg-black">
                <div className='flex-grow flex flex-col overflow-hidden max-w-4xl mx-auto w-full'>
                    <div className='bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10 p-4 shadow-lg border-b border-zinc-700'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                                <Link to={"/chat"} className='text-gray-400 hover:text-white p-2 -ml-2'>
                                    <ChevronLeft size={24}/>
                                </Link>
                                <img
                                    src={match.image || "/avatar.png"}
                                    className='w-10 h-10 object-cover rounded-full border-2 border-yellow-400'
                                    alt={match.name}
                                />
                                <div>
                                    <h2 className='text-lg font-bold text-white'>{match.name}</h2>
                                    <span className='text-xs text-green-400'>Online</span>
                                </div>
                            </div>
                            <div className='flex items-center space-x-2 text-gray-400'>
                                <button className='p-2 hover:bg-zinc-700 rounded-full transition-colors'><Phone className='w-5 h-5' /></button>
                                <button className='p-2 hover:bg-zinc-700 rounded-full transition-colors'><VideoCamera className='w-5 h-5' /></button>
                            </div>
                        </div>
                    </div>

                    <div className='flex-grow overflow-y-auto p-4 space-y-4'>
                        {messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${msg.sender === authUser._id ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[75%] p-3 rounded-2xl shadow-md ${ msg.sender === authUser._id ? "bg-yellow-400 text-black rounded-br-none" : "bg-zinc-800 text-white rounded-bl-none" }`}>
                                    <p className='text-sm md:text-base'>{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className='p-4 bg-zinc-900 border-t border-zinc-700/50'>
                        <MessageInput match={match} />
                    </div>
                </div>
            </div>
        </Layout>
	);
};

const MatchNotFound = () => (
	<div className='h-screen flex flex-col items-center justify-center bg-black text-white'>
        <UserX size={64} className='mx-auto text-red-500 mb-4' />
        <h2 className='text-2xl font-bold mb-2'>Match Not Found</h2>
        <Link to="/" className='px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg'>Back to Discover</Link>
	</div>
);

const LoadingMessagesUI = () => (
	<div className='h-screen flex items-center justify-center bg-black text-white'>
		<Loader2 size={48} className='mx-auto text-yellow-400 animate-spin' />
	</div>
);

export default ConversationPage;