import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  User, PlusCircle, Settings, Calendar, ArrowUpRight, Filter, Trash2, Edit
} from "lucide-react";
import UserHeader from "../../components/user/UserHeader";
import Loading from "../../components/Loading";
import userService from "../../services/user.service";
import GetUserResponse from "../../model/response/user/GetUserResponse";
import ErrorResponse from "../../model/response/ErrorResponse";
const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080";

// Mock news data for placeholders
const mockNews = [
  {
    id: "1",
    title: "New Climate Policy Announced by European Union",
    description: "The European Union has unveiled a comprehensive climate policy aimed at reducing carbon emissions by 55% before 2030.",
    url: "https://example.com/news/climate-policy",
    category: "Politics",
    status: "Completed",
    createdAt: "2025-03-15T10:30:00Z"
  },
  {
    id: "2",
    title: "Breakthrough in Quantum Computing Research",
    description: "Scientists report significant progress in quantum error correction, bringing practical quantum computers one step closer to reality.",
    url: "https://example.com/news/quantum-computing",
    category: "Technology",
    status: "Completed",
    createdAt: "2025-03-12T14:15:00Z"
  },
  {
    id: "3",
    title: "Global Financial Markets React to Interest Rate Changes",
    description: "Markets worldwide show volatility as central banks adjust interest rates in response to inflation concerns.",
    url: "https://example.com/news/financial-markets",
    category: "Business",
    status: "Processing",
    createdAt: "2025-03-19T09:45:00Z"
  },
];

// NewsCard component to display individual news items
const NewsCard: React.FC<{
  news: any,
  darkMode: boolean,
  onDelete: (id: string) => void
}> = ({ news, darkMode, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border transition-all duration-500 hover:shadow-lg ${
        darkMode 
          ? 'bg-slate-800 border-slate-700 hover:shadow-indigo-500/10' 
          : 'bg-white border-slate-200 hover:shadow-blue-300/20'
      }`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>{news.title}</h3>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => {}} 
              className={`p-1.5 rounded-full transition-colors ${
                darkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(news.id)} 
              className={`p-1.5 rounded-full transition-colors ${
                darkMode ? 'text-slate-400 hover:bg-red-900/30 hover:text-red-400' : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
              }`}
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <p className={`mb-3 line-clamp-2 ${
          darkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>{news.description || "No description available."}</p>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-1">
            <Calendar className={`w-4 h-4 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <span className={`text-xs ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>{formatDate(news.createdAt)}</span>
          </div>
          
          <div className="flex items-center">
            <a 
              href={news.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center text-sm font-medium ${
                darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
              }`}
            >
              View Source
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
      
      <div className={`px-5 py-3 border-t flex justify-between items-center ${
        darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            darkMode ? 'bg-slate-700 text-indigo-300' : 'bg-indigo-100 text-indigo-800'
          }`}>
            {news.category || "Uncategorized"}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            news.status === 'Completed'
              ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
              : darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-800'
          }`}>
            {news.status}
          </div>
        </div>
        
        <a 
          href={`/news/${news.id}`}
          className={`text-sm font-medium ${
            darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
          }`}
        >
          View Graph
        </a>
      </div>
    </motion.div>
  );
};

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  // Add state for user profile image
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const navigate = useNavigate();

  // Update the HTML class when theme changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  
  // Check if user image exists
  const fetchUserImage = (userId: string) => {
    // Use timestamp to prevent caching
    const timestamp = new Date().getTime();
    const imageUrl = `${API_URL}/api/user/image/${userId}?t=${timestamp}`;
    
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
  
  // Fetch user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first");
      navigate("/sign-in");
      return;
    }

    userService.getMe(token)
      .then((data: GetUserResponse) => {
        const userData = {
          id: data.user.id || "",
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        };
        
        setUser(userData);
        
        // Once we have the user ID, check for the profile image
        if (userData.id) {
          fetchUserImage(userData.id);
        } else {
          setImageLoaded(true);
        }
        
        setLoading(false);
      })
      .catch((error: ErrorResponse) => {
        toast.error(error.message);
        navigate("/sign-in");
      });
  }, [navigate]);

  const handleDeleteNews = (id: string) => {
    // This would call the API in a real implementation
    toast.success("News item deleted successfully (mock)");
  };
  
  const filteredNews = filter === "all" 
    ? mockNews 
    : mockNews.filter(item => item.status.toLowerCase() === filter.toLowerCase());

  if (loading || !imageLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        darkMode 
          ? 'bg-gradient-to-r from-slate-900 to-indigo-950' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-100'
      }`}>
        <Loading />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-slate-950 text-white' 
        : 'bg-slate-50 text-slate-800'
    }`}>
      <UserHeader 
        user={user} 
        darkMode={darkMode} 
        toggleTheme={toggleTheme} 
        activeTab="profile" 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <div className={`rounded-xl border transition-colors duration-500 overflow-hidden ${
            darkMode 
              ? 'bg-slate-900 border-slate-800' 
              : 'bg-white border-slate-200'
          }`}>
            <div className={`h-40 bg-gradient-to-r from-indigo-600 to-purple-600`}></div>
            <div className="p-6 relative">
              <div className="absolute -top-16 left-6">
                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 flex items-center justify-center text-white text-5xl font-bold ${
                  darkMode ? 'border-slate-900' : 'border-white'
                } ${
                  userImageUrl ? '' : (darkMode ? 'bg-slate-800' : 'bg-indigo-600')
                }`}>
                  {userImageUrl ? (
                    <img 
                      src={userImageUrl} 
                      alt={user?.name || "Profile"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              
              <div className="mt-16 flex flex-col md:flex-row md:justify-between md:items-end">
                <div>
                  <h1 className={`text-2xl font-bold mb-1 ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>{user?.name}</h1>
                  <p className={`${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>{user?.email}</p>
                  <p className={`px-2 py-1 mt-2 rounded-full text-xs w-fit font-medium ${
                    user.role === 'ADMIN'
                      ? darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                      : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.role}
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-4">
                  <Link 
                    to="/user/settings"
                    className={`px-4 py-2 rounded-lg border transition-colors flex items-center ${
                      darkMode 
                        ? 'border-slate-700 hover:bg-slate-800 text-white' 
                        : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                  <Link 
                    to="/user/upload"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Upload News
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className={`p-4 rounded-lg border transition-colors duration-500 ${
                  darkMode 
                    ? 'bg-slate-800/50 border-slate-700' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <h3 className={`text-lg font-medium mb-1 ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>Total Uploads</h3>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{mockNews.length}</p>
                </div>
                
                <div className={`p-4 rounded-lg border transition-colors duration-500 ${
                  darkMode 
                    ? 'bg-slate-800/50 border-slate-700' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <h3 className={`text-lg font-medium mb-1 ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>Processing</h3>
                  <p className="text-2xl font-bold text-amber-500">
                    {mockNews.filter(item => item.status === "Processing").length}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg border transition-colors duration-500 ${
                  darkMode 
                    ? 'bg-slate-800/50 border-slate-700' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <h3 className={`text-lg font-medium mb-1 ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>Completed</h3>
                  <p className="text-2xl font-bold text-green-500">
                    {mockNews.filter(item => item.status === "Completed").length}
                  </p>
                </div>
              </div>
              
              {user.role === "ADMIN" && (
                <div className="mt-6">
                  <Link 
                    to="/admin/dashboard"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className={`text-2xl font-bold mb-4 md:mb-0 ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>Your News Uploads</h2>
            
            <div className="flex space-x-2 items-center">
              <div className={`flex items-center px-3 py-2 rounded-lg border transition-colors duration-500 ${
                darkMode 
                  ? 'bg-slate-900 border-slate-800' 
                  : 'bg-white border-slate-200'
              }`}>
                <Filter className={`w-4 h-4 mr-2 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className={`bg-transparent border-none focus:ring-0 text-sm ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <Link 
                to="/user/upload"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Upload
              </Link>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => (
            <NewsCard 
              key={item.id} 
              news={item} 
              darkMode={darkMode} 
              onDelete={handleDeleteNews} 
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;