import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Network, Moon, Sun, LogOut, PlusCircle, User, 
  Settings, BarChart2, ChevronDown
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UserModel from "../../model/User";

interface UserHeaderProps {
  user: UserModel | null;
  darkMode: boolean;
  toggleTheme: () => void;
  activeTab: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ 
  user, 
  darkMode, 
  toggleTheme, 
  activeTab 
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/user/dashboard", icon: <BarChart2 className="w-5 h-5 mr-2" /> },
    { name: "Profile", path: "/user/profile", icon: <User className="w-5 h-5 mr-2" /> },
    { name: "Upload News", path: "/user/upload", icon: <PlusCircle className="w-5 h-5 mr-2" /> }
  ];

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors duration-500 backdrop-blur-md ${
      darkMode 
        ? 'bg-slate-900/80 border-slate-800' 
        : 'bg-white/80 border-slate-200'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Network className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">GraphNova</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`transition-colors flex items-center ${
                  activeTab === item.name.toLowerCase() 
                    ? 'text-indigo-600 dark:text-indigo-400 font-medium' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* User menu & actions */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                darkMode 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20' 
                  : 'bg-gradient-to-r from-amber-300 to-orange-400 shadow-lg shadow-amber-300/20'
              }`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={darkMode ? "dark" : "light"}
                  initial={{ y: -10, opacity: 0, rotate: -20 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 10, opacity: 0, rotate: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4 text-white" />
                  ) : (
                    <Moon className="w-4 h-4 text-white" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className={`flex items-center space-x-2 rounded-full transition-colors ${
                  darkMode 
                    ? 'hover:bg-slate-800' 
                    : 'hover:bg-slate-100'
                } p-1 pr-3`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                  darkMode ? 'bg-indigo-600' : 'bg-indigo-500'
                }`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  {user?.name}
                </span>
                <ChevronDown className={`w-4 h-4 ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`} />
              </button>
              
              {menuOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg transition-colors duration-500 border ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700' 
                    : 'bg-white border-slate-200'
                }`}>
                  <div className={`px-4 py-3 border-b ${
                    darkMode ? 'border-slate-700' : 'border-slate-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-slate-800'
                    }`}>{user?.name}</p>
                    <p className={`text-xs truncate ${
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>{user?.email}</p>
                  </div>
                  
                  <div className="py-1">
                    {/* Mobile menu items */}
                    <div className="md:hidden">
                      {menuItems.map((item) => (
                        <Link 
                          key={item.path}
                          to={item.path} 
                          className={` px-4 py-2 text-sm transition-colors flex items-center ${
                            darkMode 
                              ? 'text-slate-300 hover:bg-slate-700' 
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      ))}
                      <div className={`my-1 border-t ${
                        darkMode ? 'border-slate-700' : 'border-slate-200'
                      }`}></div>
                    </div>
                    
                    <Link 
                      to="/user/settings" 
                      className={` px-4 py-2 text-sm transition-colors flex items-center ${
                        darkMode 
                          ? 'text-slate-300 hover:bg-slate-700' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      Settings
                    </Link>
                    
                    <button 
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className={` w-full text-left px-4 py-2 text-sm transition-colors flex items-center ${
                        darkMode 
                          ? 'text-red-400 hover:bg-slate-700' 
                          : 'text-red-600 hover:bg-slate-100'
                      }`}
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;