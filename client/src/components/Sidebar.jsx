import { useEffect, useState } from "react";
import { Heart, Loader, MessageCircle, X, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useMatchStore } from "../store/useMatchStore";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);
    const { getMyMatches, matches, isLoadingMyMatches } = useMatchStore();

    useEffect(() => {
        getMyMatches();
    }, [getMyMatches]);

    return (
        <>
            <div 
                className={`
                    fixed inset-y-0 left-0 z-20 w-80 bg-gradient-to-b from-white to-pink-50 
                    shadow-2xl rounded-r-3xl overflow-hidden transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 lg:static lg:w-1/4
                `}
            >
                <div className='flex flex-col h-full'>
                    {/* Header */}
                    <div className='p-6 pb-4 border-b border-pink-200 flex justify-between items-center'>
                        <div className="flex items-center space-x-3">
                            <Heart size={32} className="text-pink-600" />
                            <h2 className='text-2xl font-bold text-pink-600'>Matches</h2>
                        </div>
                        <button
                            className='lg:hidden p-2 text-gray-500 hover:text-pink-600 focus:outline-none'
                            onClick={toggleSidebar}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className='flex-grow overflow-y-auto p-4 space-y-3 z-10 relative'>
                        {isLoadingMyMatches ? (
                            <LoadingState />
                        ) : matches.length === 0 ? (
                            <NoMatchesFound />
                        ) : (
                            matches.map((match) => (
                                <Link key={match._id} to={`/chat/${match._id}`}>
                                    <div className='
                                        flex items-center justify-between 
                                        bg-white border border-pink-100 
                                        hover:bg-pink-50 hover:shadow-md 
                                        p-3 rounded-xl 
                                        transition-all duration-300 
                                        group
                                    '>
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={match.image || "/avatar.png"}
                                                alt='User avatar'
                                                className='size-12 object-cover rounded-full border-2 border-pink-300'
                                            />
                                            <h3 className='font-semibold text-gray-800 group-hover:text-pink-600'>{match.name}</h3>
                                        </div>
                                        <ChevronRight 
                                            size={20} 
                                            className="text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <button
                className='
                    lg:hidden fixed top-4 left-4 
                    p-3 bg-gradient-to-r from-pink-500 to-pink-600 
                    text-white rounded-full shadow-lg z-10 
                    hover:scale-110 transition-all
                '
                onClick={toggleSidebar}
            >
                <MessageCircle size={24} />
            </button>
        </>
    );
};

export default Sidebar;

const NoMatchesFound = () => (
    <div className='flex flex-col items-center justify-center h-full text-center space-y-4 p-6 bg-pink-50 rounded-2xl'>
        <Heart className='text-pink-400 animate-pulse' size={64} />
        <div>
            <h3 className='text-xl font-bold text-gray-700 mb-2'>No Matches Yet</h3>
            <p className='text-gray-500 max-w-xs'>
                Don&apos;t worry! Your perfect match is just around the corner. Keep swiping!
            </p>
        </div>
    </div>
);

const LoadingState = () => (
    <div className='flex flex-col items-center justify-center h-full text-center space-y-4 p-6 bg-pink-50 rounded-2xl'>
        <Loader className='text-pink-500 mb-4 animate-spin' size={64} />
        <div>
            <h3 className='text-xl font-bold text-gray-700 mb-2'>Loading Matches</h3>
            <p className='text-gray-500 max-w-xs'>
                We&apos;re finding your perfect matches. This might take a moment...
            </p>
        </div>
    </div>
);