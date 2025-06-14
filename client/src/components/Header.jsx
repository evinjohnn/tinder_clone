// client/src/components/Header.jsx
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Menu } from "lucide-react"; // UPDATED: Removed Flame import
import logo from '../images/logo.png'; // NEW: Import the logo

export const Header = () => {
	const { authUser, logout } = useAuthStore();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		logout();
		setDropdownOpen(false);
		setMobileMenuOpen(false);
		navigate("/auth");
	};

	return (
		<header className='bg-black/30 backdrop-blur-xl border-b border-zinc-700/30 sticky top-0 z-30'>
			<div className='max-w-7xl mx-auto px-4'>
				<div className='flex justify-between items-center h-16'>
					<Link to='/' className='flex items-center space-x-3'>
						{/* UPDATED: Replaced the yellow box and flame icon with your logo */}
						<img src={logo} alt='DateX Logo' className='w-8 h-8' />
						<span className='text-xl font-bold text-white'>DateX</span>
					</Link>

					<div className='hidden md:flex items-center space-x-6'>
						{authUser ? (
							<div className='relative' ref={dropdownRef}>
								<button
									onClick={() => setDropdownOpen(!dropdownOpen)}
									className='flex items-center px-3 py-1 rounded-full hover:bg-zinc-800 transition'
								>
									<img
										src={authUser.image || "/avatar.png"}
										alt='User'
										className='w-8 h-8 rounded-full object-cover'
									/>
									<span className='ml-2 text-white font-medium'>{authUser.name}</span>
								</button>
								{dropdownOpen && (
									<div className='absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700/50 rounded-md shadow-lg py-1'>
										<Link
											to='/profile'
											onClick={() => setDropdownOpen(false)}
											className='flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-yellow-400/20 hover:text-yellow-300'
										>
											<User size={16} /> Profile
										</Link>
										<button
											onClick={handleLogout}
											className='flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-yellow-400/20 hover:text-yellow-300'
										>
											<LogOut size={16} /> Logout
										</button>
									</div>
								)}
							</div>
						) : (
							<>
								<Link to='/auth' className='text-white hover:text-gray-300 transition'>
									Login
								</Link>
								<Link
									to='/auth'
									className='bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition'
								>
									Sign Up
								</Link>
							</>
						)}
					</div>

					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className='md:hidden p-2 rounded hover:bg-zinc-800 transition'
					>
						<Menu className='w-6 h-6 text-white' />
					</button>
				</div>
			</div>

			{mobileMenuOpen && (
				<div className='md:hidden border-t border-zinc-700/30'>
					<div className='px-4 py-3 space-y-1'>
						{authUser ? (
							<>
								<Link
									to='/profile'
									onClick={() => setMobileMenuOpen(false)}
									className='block px-4 py-2 text-white hover:bg-zinc-800 rounded'
								>
									Profile
								</Link>
								<button
									onClick={handleLogout}
									className='block w-full text-left px-4 py-2 text-white hover:bg-zinc-800 rounded'
								>
									Logout
								</button>
							</>
						) : (
							<>
								<Link
									to='/auth'
									onClick={() => setMobileMenuOpen(false)}
									className='block px-4 py-2 text-white hover:bg-zinc-800 rounded'
								>
									Login
								</Link>
								<Link
									to='/auth'
									onClick={() => setMobileMenuOpen(false)}
									className='block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-center'
								>
									Sign Up
								</Link>
							</>
						)}
					</div>
				</div>
			)}
		</header>
	);
};