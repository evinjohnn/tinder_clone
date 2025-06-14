// client/src/components/Sidebar.jsx
import { useState } from "react";
import { Heart, Loader, MessageCircle, X, ChevronRight } from "lucide-react";
import { Link, NavLink } from "react-router-dom"; // Use NavLink for active styles
import { useMatchStore } from "../store/useMatchStore";

const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const toggleSidebar = () => setIsOpen(!isOpen);

    // FIX: Get all data from the store, no local useEffect for fetching.
    // Use the unified `isLoading` flag.
	const { matches, incomingLikes, isLoading } = useMatchStore();

	const activeLinkStyle = {
		background: 'rgba(250, 204, 21, 0.1)', // A subtle yellow background for the active tab
		borderColor: 'rgba(250, 204, 21, 0.3)',
	};

	return (
		<>
			<div
				className={`
                    fixed inset-y-0 left-0 z-40 w-80 bg-black/30 backdrop-blur-xl
                    shadow-2xl overflow-hidden transition-transform duration-300 ease-in-out
                    border-r border-zinc-700/30
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 lg:static lg:w-1/4
                `}
			>
				<div className='flex flex-col h-full'>
					{/* Header with Tabs */}
					<div className='p-4 border-b border-yellow-400/20 flex justify-between items-center'>
						<div className="flex-1 grid grid-cols-2 gap-2">
							<NavLink to="/" end className="sidebar-tab" style={({isActive}) => isActive ? activeLinkStyle : {}}>
								<MessageCircle size={20} />
								<span>Matches</span>
								{matches.length > 0 && <span className="tab-badge">{matches.length}</span>}
							</NavLink>
							<NavLink to="/likes" className="sidebar-tab" style={({isActive}) => isActive ? activeLinkStyle : {}}>
								<Heart size={20} />
								<span>Likes</span>
								{incomingLikes.length > 0 && <span className="tab-badge">{incomingLikes.length}</span>}
							</NavLink>
						</div>
						<button
							className='lg:hidden p-2 text-gray-400 hover:text-yellow-400 focus:outline-none ml-2'
							onClick={toggleSidebar}
						>
							<X size={24} />
						</button>
					</div>

					<div className='flex-grow overflow-y-auto p-4 space-y-3'>
						{isLoading ? <LoadingState /> :
							matches.length === 0 ? <NoMatchesFound /> : (
							matches.map((match) => (
								<Link key={match._id} to={`/chat/${match._id}`} onClick={() => setIsOpen(false)}>
									<div className='sidebar-item group'>
										<div className='flex items-center space-x-3'>
											<img
												src={match.image || "/avatar.png"}
												alt='User avatar'
												className='size-12 object-cover rounded-full border-2 border-yellow-400/50'
											/>
											<h3 className='font-semibold text-gray-100 group-hover:text-yellow-400'>
												{match.name}
											</h3>
										</div>
										<ChevronRight
											size={20}
											className='text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity'
										/>
									</div>
								</Link>
							))
						)}
					</div>
				</div>
			</div>
			{/* Mobile toggle button */}
			<button
				className={`
                    lg:hidden fixed top-4 left-4 
                    p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 
                    text-black rounded-full shadow-lg z-30
                    hover:scale-110 transition-all
                    ${isOpen ? "opacity-0" : "opacity-100"}
                `}
				onClick={toggleSidebar}
			>
				<MessageCircle size={24} />
			</button>

            {/* Add some CSS for the new sidebar styles */}
            <style jsx>{`
                .sidebar-tab {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    border-radius: 9999px;
                    font-weight: 600;
                    color: #d4d4d8; /* text-zinc-400 */
                    transition: all 0.2s;
                    position: relative;
                    border: 1px solid transparent;
                }
                .sidebar-tab:hover {
                    background-color: rgba(250, 204, 21, 0.05);
                    color: #fde047; /* text-yellow-300 */
                }
                .tab-badge {
                    background-color: #ef4444; /* bg-red-500 */
                    color: white;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    padding: 0 0.4rem;
                    position: absolute;
                    top: -2px;
                    right: 4px;
                }
                .sidebar-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background-color: rgba(39, 39, 42, 0.5); /* bg-zinc-800/50 */
                    border: 1px solid rgba(63, 63, 70, 0.2); /* border-zinc-700/20 */
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    transition: all 0.3s;
                }
                .sidebar-item:hover {
                    background-color: rgba(250, 204, 21, 0.1);
                    border-color: rgba(250, 204, 21, 0.3);
                }
            `}</style>
		</>
	);
};

// ... (NoMatchesFound and LoadingState can remain the same)
const NoMatchesFound = () => (
    <div className='flex flex-col items-center justify-center h-full text-center space-y-4 p-6'>
        <MessageCircle className='text-zinc-500' size={48} />
        <div>
            <h3 className='text-lg font-bold text-gray-100 mb-1'>No Matches Yet</h3>
            <p className='text-gray-400 text-sm'>Start a conversation once you match with someone.</p>
        </div>
    </div>
);

const LoadingState = () => (
    <div className='flex items-center justify-center h-full'>
        <Loader className='text-yellow-400 animate-spin' size={32} />
    </div>
);


export default Sidebar;