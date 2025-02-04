import { useEffect } from "react";
import { Header } from "../components/Header";
import { useAuthStore } from "../store/useAuthStore";
import { useMatchStore } from "../store/useMatchStore";
import { useMessageStore } from "../store/useMessageStore";
import { Link, useParams } from "react-router-dom";
import { Loader, UserX, Phone, Info } from "lucide-react";
import MessageInput from "../components/MessageInput";

const ChatPage = () => {
  const { getMyMatches, matches, isLoadingMyMatches } = useMatchStore();
  const { messages, getMessages, subscribeToMessages, unsubscribeFromMessages } = useMessageStore();
  const { authUser } = useAuthStore();
  const { id } = useParams();
  const match = matches.find((m) => m?._id === id);

  useEffect(() => {
    if (authUser && id) {
      getMyMatches();
      getMessages(id);
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [getMyMatches, authUser, getMessages, subscribeToMessages, unsubscribeFromMessages, id]);

  if (isLoadingMyMatches) return <LoadingMessagesUI />;
  if (!match) return <MatchNotFound />;

  return (
    <div className="flex flex-col h-screen bg-black">
      <Header />

      <div className="flex-grow flex flex-col overflow-hidden max-w-4xl mx-auto w-full">
        {/* Chat Header */}
        <div className="bg-[#FFC629] bg-opacity-95 p-4 rounded-b-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={match.image || "/avatar.png"}
                className="w-12 h-12 object-cover rounded-full border-2 border-white"
                alt={match.name}
              />
              <div>
                <h2 className="text-xl font-bold text-black">{match.name}</h2>
                <span className="text-sm text-black opacity-75">Online now</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-yellow-400 rounded-full transition-colors">
                <Phone className="w-6 h-6 text-black" />
              </button>
              <button className="p-2 hover:bg-yellow-400 rounded-full transition-colors">
                <VideoCamera className="w-6 h-6 text-black" />
              </button>
              <button className="p-2 hover:bg-yellow-400 rounded-full transition-colors">
                <Info className="w-6 h-6 text-black" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-16 h-16 bg-[#FFC629] rounded-full flex items-center justify-center">
                <img
                  src={match.image || "/avatar.png"}
                  className="w-12 h-12 rounded-full object-cover"
                  alt={match.name}
                />
              </div>
              <p className="text-[#FFC629] text-lg">Start your conversation with {match.name}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.sender === authUser._id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    msg.sender === authUser._id
                      ? "bg-[#FFC629] text-black rounded-br-none"
                      : "bg-gray-800 text-white rounded-bl-none"
                  }`}
                >
                  <p className="text-sm md:text-base">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input Area */}
        <div className="p-4 bg-gray-900 rounded-t-2xl">
          <MessageInput match={match} />
        </div>
      </div>
    </div>
  );
};

const MatchNotFound = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-black">
    <div className="bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4">
      <UserX size={64} className="mx-auto text-[#FFC629] mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Match Not Found</h2>
      <p className="text-gray-400 mb-6">This match doesn't exist or has been removed.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-[#FFC629] text-black font-semibold rounded-xl hover:bg-yellow-400 
        transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 
        focus:ring-offset-gray-900 inline-block"
      >
        Back to Matches
      </Link>
    </div>
  </div>
);

const LoadingMessagesUI = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-black">
    <div className="bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4">
      <Loader size={48} className="mx-auto text-[#FFC629] animate-spin mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Loading Chat</h2>
      <p className="text-gray-400">Please wait while we fetch your conversation...</p>
      <div className="mt-6 flex justify-center space-x-2">
        <div className="w-3 h-3 bg-[#FFC629] rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
        <div className="w-3 h-3 bg-[#FFC629] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        <div className="w-3 h-3 bg-[#FFC629] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
      </div>
    </div>
  </div>
);

export default ChatPage;