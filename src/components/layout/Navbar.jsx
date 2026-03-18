import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-50 rounded-lg"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black text-black tracking-tight uppercase cursor-pointer" onClick={() => navigate('/')}>
            {user?.storeName || 'MODERN RETAIL'}
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            {user?.name || 'Authorized User'} • {user?.role || 'STAFF'}
          </p>
        </div>

      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl w-64 focus-within:w-80 focus-within:border-black focus-within:bg-white transition-all duration-300">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search keywords..." 
            className="bg-transparent border-none outline-none ml-2 text-sm w-full placeholder:text-gray-400"
          />
        </div>

        {/* Notifications */}
        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100"
        >
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full border-2 border-white animate-bounce"></span>
        </button>

        {/* Profile Dropdown (Simplified) */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right">
            <p className="text-sm font-bold">{user?.name || 'Admin User'}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user?.role || 'ADMIN'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0] || 'A'}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
