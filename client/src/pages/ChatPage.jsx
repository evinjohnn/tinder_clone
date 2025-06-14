// client/src/pages/ChatPage.jsx
import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Header } from "../components/Header";
import { useMatchStore, useMessageStore } from "../store"; // FIX: Correctly import all stores
import { Link, useParams } from "react-router-dom";
import { Loader, UserX, Phone, Info, Video as VideoCamera } from "lucide-react"; // FIX: Import VideoCamera
import MessageInput from "../components/MessageInput";

const ChatPage = () => {
	const { id } = useParams();
	const messagesEndRef = useRef(null);

	// FIX: Use a stable dependency 'id' for useEffect
	const { match, getMyMatches, isLoadingMyMatches } = useMatchStore((state) => ({
		match: state.matches.find((m) => m._id === id),
		getMyMatches: state.getMyMatches,
		isLoadingMyMatches: state.isLoadingMyMatches,
	}));

	const { messages, getMessages, subscribeToMessages, unsubscribeFromMessages, isLoadingMessages } =
		useMessageStore((state) => ({
			messages: state.messages,
			getMessages: state.getMessages,
			subscribeToMessages: state.subscribeToMessages,
			unsubscribeFromMessages: state.unsubscribeFromMessages,
			isLoadingMessages: state.loading,
		}));

	const { authUser } = useAuthStore();

	useEffect(() => {
		getMyMatches();
	}, [getMyMatches]);

	// FIX: Separated effects for clarity and correctness
	useEffect(() => {
		if (id) {
			getMessages(id);
			subscribeToMessages();
		}
		// The socket connection lifecycle is now managed by useAuthStore, not this page.
		return () => {
			unsubscribeFromMessages();
		};
	}, [id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	if (isLoadingMyMatches || isLoadingMessages) return <LoadingMessagesUI />;
	if (!match) return <MatchNotFound />;

	return (
		<div className='flex flex-col h-screen bg-black'>
			{/* The Header now has a transparent, blurred background, so we don't need a separate component for it */}
			<Header />

			<div className='flex-grow flex flex-col overflow-hidden max-w-4xl mx-auto w-full'>
				{/* Chat Header */}
				<div className='bg-zinc-900 p-4 rounded-b-2xl shadow-lg border-b border-zinc-700'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-3'>
							<Link to={"/"} className='text-gray-400 hover:text-white md:hidden'>
								←
							</Link>
							<img
								src={match.image || "/avatar.png"}
								className='w-12 h-12 object-cover rounded-full border-2 border-yellow-400'
								alt={match.name}
							/>
							<div>
								<h2 className='text-xl font-bold text-white'>{match.name}</h2>
								<span className='text-sm text-green-400'>Online</span>
							</div>
						</div>
						<div className='flex items-center space-x-2 text-gray-400'>
							<button className='p-2 hover:bg-zinc-700 rounded-full transition-colors'>
								<Phone className='w-5 h-5' />
							</button>
							<button className='p-2 hover:bg-zinc-700 rounded-full transition-colors'>
								<VideoCamera className='w-5 h-5' />
							</button>
							<button className='p-2 hover:bg-zinc-700 rounded-full transition-colors'>
								<Info className='w-5 h-5' />
							</button>
						</div>
					</div>
				</div>

				{/* Messages Area */}
				<div className='flex-grow overflow-y-auto p-4 space-y-4'>
					{messages.length === 0 ? (
						<div className='flex flex-col items-center justify-center h-full text-center'>
							<div className='w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-4'>
								<img
									src={match.image || "/avatar.png"}
									className='w-20 h-20 rounded-full object-cover'
									alt={match.name}
								/>
							</div>
							<p className='text-gray-300 text-lg'>
								You matched with <span className='font-bold text-yellow-400'>{match.name}</span>
							</p>
							<p className='text-gray-500'>Send a message to start the conversation.</p>
						</div>
					) : (
						messages.map((msg) => (
							<div
								key={msg._id}
								className={`flex ${msg.sender === authUser._id ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[75%] p-3 rounded-2xl shadow-md ${
										msg.sender === authUser._id
											? "bg-yellow-400 text-black rounded-br-none"
											: "bg-zinc-800 text-white rounded-bl-none"
									}`}
								>
									<p className='text-sm md:text-base'>{msg.content}</p>
								</div>
							</div>
						))
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Message Input Area */}
				<div className='p-4 bg-zinc-900 border-t border-zinc-700/50'>
					<MessageInput match={match} />
				</div>
			</div>
		</div>
	);
};

// ... keep MatchNotFound and LoadingMessagesUI components as they were
const MatchNotFound = () => (
	<div className='h-screen flex flex-col items-center justify-center bg-black'>
		<div className='bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4'>
			<UserX size={64} className='mx-auto text-[#FFC629] mb-4' />
			<h2 className='text-2xl font-bold text-white mb-2'>Match Not Found</h2>
			<p className='text-gray-400 mb-6'>This match doesn't exist or has been removed.</p>
			<Link
				to='/'
				className='px-6 py-3 bg-[#FFC629] text-black font-semibold rounded-xl hover:bg-yellow-400 
        transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 
        focus:ring-offset-gray-900 inline-block'
			>
				Back to Swiping
			</Link>
		</div>
	</div>
);

const LoadingMessagesUI = () => (
	<div className='h-screen flex flex-col items-center justify-center bg-black'>
		<div className='bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4'>
			<Loader size={48} className='mx-auto text-[#FFC629] animate-spin mb-4' />
			<h2 className='text-2xl font-bold text-white mb-2'>Loading Chat</h2>
			<p className='text-gray-400'>Please wait while we fetch your conversation...</p>
			<div className='mt-6 flex justify-center space-x-2'>
				<div className='w-3 h-3 bg-[#FFC629] rounded-full animate-bounce' style={{ animationDelay: "0s" }}></div>
				<div className='w-3 h-3 bg-[#FFC629] rounded-full animate-bounce' style={{ animationDelay: "0.2s" }}></div>
				<div className='w-3 h-3 bg-[#FFC629] rounded-full animate-bounce' style={{ animationDelay: "0.4s" }}></div>
			</div>
		</div>
	</div>
);

export default ChatPage;