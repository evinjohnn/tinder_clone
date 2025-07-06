// client/src/components/Layout.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children, className = "" }) => {
    const { isDark } = useTheme();
    
    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDark 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900' 
                : 'bg-gradient-to-br from-pink-50 via-white to-purple-50'
        } ${className}`}>
            {children}
        </div>
    );
};

export default Layout;