import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  Users, 
  RefreshCw, 
  FileText, 
  AlertTriangle, 
  Clock, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Layers,
  Bell
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Categories', icon: Layers, path: '/categories' },
    { name: 'Inventory', icon: History, path: '/inventory' },

    { name: 'Suppliers', icon: Users, path: '/suppliers' },
    { name: 'Reorders', icon: RefreshCw, path: '/reorders' },
    { name: 'Billing', icon: FileText, path: '/billing' },
    { name: 'Low Stock', icon: AlertTriangle, path: '/low-stock' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Expiry', icon: Clock, path: '/expiry' },
    ...(isAdmin() ? [{ name: 'Personnel', icon: Users, path: '/manage-staff' }] : []),
  ];


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div 
      className={`h-screen bg-black text-white transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between border-b border-gray-800">
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-tight">GROCERY<span className="text-gray-400">POS</span></span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Profile Section */}
      <div className={`p-6 border-b border-gray-800 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
            <User size={20} className="text-gray-400" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="font-medium truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role || 'Administrator'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-400 hover:bg-gray-900 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon size={20} />
            {!isCollapsed && <span className="font-medium">{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {/* Footer Section */}
      <div className="p-4 space-y-1 border-t border-gray-800">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'bg-white text-black' 
                : 'text-gray-400 hover:bg-gray-900 hover:text-white'
            } ${isCollapsed ? 'justify-center' : ''}`
          }
        >
          <Settings size={20} />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
