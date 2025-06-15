// client/src/components/BottomNavBar.jsx
import React from 'react';
import { Compass, Heart, MessageCircle, User as UserIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useMatchStore } from '../store';

const BottomNavBar = () => {
    // FIX: Use nullish coalescing (??) to provide a safe default (empty array).
    // This prevents the app from crashing if the store data is not yet available.
    const { incomingLikes = [], matches = [] } = useMatchStore(state => ({
        incomingLikes: state.incomingLikes,
        matches: state.matches,
    }));

    const navItems = [
        { to: "/", icon: Compass, label: "Discover", badgeCount: 0 },
        { to: "/likes", icon: Heart, label: "Likes", badgeCount: incomingLikes.length },
        { to: "/chat", icon: MessageCircle, label: "Messages", badgeCount: matches.length },
        { to: "/profile", icon: UserIcon, label: "Profile", badgeCount: 0 },
    ];

    const activeStyle = {
        color: '#facc15', // a vibrant yellow (theme.colors.yellow[400])
        transform: 'scale(1.05)',
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/70 backdrop-blur-lg border-t border-zinc-700/50 z-50">
            <div className="max-w-md mx-auto h-full grid grid-cols-4 gap-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        end={item.to === "/"}
                        style={({ isActive }) => (isActive ? activeStyle : {})}
                        className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white transition-all duration-200 ease-in-out group"
                    >
                        <div className="relative">
                            <item.icon size={28} strokeWidth={2.5} />
                            {item.badgeCount > 0 && (
                                <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-black/70">
                                    {item.badgeCount}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNavBar;