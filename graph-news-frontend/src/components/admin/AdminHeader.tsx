import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Network, Moon, Sun, LogOut, Users, BarChart2, 
  Settings, PlusCircle, ChevronDown, Shield, ChevronRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UserModel from "../../model/User";

interface AdminHeaderProps {
  user: UserModel | null;
  darkMode: boolean;
  toggleTheme: () => void;
  activeTab: string;
}

const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080";

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  user, 
  darkMode, 
  toggleTheme, 
  activeTab 
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if user image exists
  useEffect(() => {
    if (user?.id) {
      const checkImage = () => {
        // Use timestamp to prevent caching
        const timestamp = new Date().getTime();
        const imageUrl = `${API_URL}/api/user/image/${user.id}?t=${timestamp}`;
        
        // Create an image element to test if the image exists
        const img = new Image();
        img.onload = () => {
          setUserImageUrl(imageUrl);
          setImageLoaded(true);
        };
        img.onerror = () => {
          setUserImageUrl(null);
          setImageLoaded(true);
        };
        img.src = imageUrl;
      };
      
      checkImage();
    } else {
      setImageLoaded(true);
    }
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Admin-specific navigation items
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <BarChart2 className="w-5 h-5 mr-2" /> },
    { name: "Users", path: "/admin/users", icon: <Users className="w-5 h-5 mr-2" /> },
    { name: "News", path: "/admin/news", icon: <PlusCircle className="w-5 h-5 mr-2" /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings className="w-5 h-5 mr-2" /> }
  ];

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors duration-500 backdrop-blur-md ${
      darkMode 
        ? 'bg-slate-900/80 border-slate-800' 
        : 'bg-white/80 border-slate-200'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo with Admin indicator */}
          <Link to="/admin/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Admin Panel</span>
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
            
            {/* Admin badge for smaller screens */}
            <div className="md:hidden flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
              }`}>
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </span>
            </div>

            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className={`flex items-center space-x-2 rounded-full transition-colors ${
                  darkMode 
                    ? 'hover:bg-slate-800' 
                    : 'hover:bg-slate-100'
                } p-1 pr-3`}
              >
                <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white font-medium ${
                  darkMode ? 'bg-indigo-600' : 'bg-indigo-500'
                }`}>
                  {imageLoaded ? (
                    userImageUrl ? (
                      <img 
                        src={userImageUrl} 
                        alt={user?.name || "Profile"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )
                  ) : (
                    <span className="opacity-50">•</span>
                  )}
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
                <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg transition-colors duration-500 border ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700' 
                    : 'bg-white border-slate-200'
                }`}>
                  <div className={`px-4 py-3 border-b ${
                    darkMode ? 'border-slate-700' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-medium ${
                        darkMode ? 'bg-indigo-600' : 'bg-indigo-500'
                      }`}>
                        {imageLoaded ? (
                          userImageUrl ? (
                            <img 
                              src={userImageUrl} 
                              alt={user?.name || "Profile"} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user?.name?.charAt(0).toUpperCase()
                          )
                        ) : (
                          <span className="opacity-50">•</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className={`text-sm font-medium ${
                            darkMode ? 'text-white' : 'text-slate-800'
                          }`}>{user?.name}</p>
                          <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                          }`}>
                            Admin
                          </span>
                        </div>
                        <p className={`text-xs truncate max-w-[150px] ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>{user?.email}</p>
                      </div>
                    </div>
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
                    
                    {/* Switch to user view */}
                    <Link 
                      to="/user/profile" 
                      className={`px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                        darkMode 
                          ? 'text-slate-300 hover:bg-slate-700' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Switch to User View
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    
                    {/* User account settings */}
                    <Link 
                      to="/user/settings" 
                      className={`px-4 py-2 text-sm transition-colors flex items-center ${
                        darkMode 
                          ? 'text-slate-300 hover:bg-slate-700' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      Account Settings
                    </Link>
                    
                    <div className={`my-1 border-t ${
                      darkMode ? 'border-slate-700' : 'border-slate-200'
                    }`}></div>
                    
                    {/* Logout */}
                    <button 
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center ${
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

export default AdminHeader;