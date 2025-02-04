import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Flame, User, LogOut, Menu } from "lucide-react";

export const Header = () => {
  const { authUser, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-lg group-hover:bg-white/20 transition-all">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
              Swipe
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {authUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 bg-white/10 p-1.5 pr-4 rounded-xl backdrop-blur-lg hover:bg-white/20 transition-all"
                >
                  <img
                    src={authUser.image || "/avatar.png"}
                    className="h-8 w-8 rounded-lg object-cover"
                    alt="User"
                  />
                  <span className="text-white text-sm font-medium">{authUser.name}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 overflow-hidden">
                    <Link
                      to="/profile"
                      className="px-4 py-3 text-sm text-white hover:bg-white/20 flex items-center transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="mr-2" size={16} />
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/20 flex items-center transition-colors"
                    >
                      <LogOut className="mr-2" size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="bg-white/10 backdrop-blur-lg text-white px-5 py-2 rounded-xl text-sm font-medium
                    hover:bg-white/20 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden bg-white/10 p-2 rounded-xl backdrop-blur-lg text-white hover:bg-white/20 transition-all"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-pink-600/80 to-pink-700/80 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {authUser ? (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
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