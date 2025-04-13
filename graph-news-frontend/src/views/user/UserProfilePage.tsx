import React, { useState, useEffect } from "react";
import { 
  Filter, PlusCircle, Loader
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import userService from "../../services/user.service";
import { getUserNewsPaged, deleteNews } from "../../services/news.service";
import UserHeader from "../../components/user/UserHeader";
import Loading from "../../components/Loading";
import NewsCard from "../../components/news/NewsCard";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import NewsCarousel from "../../components/news/NewsCarousel";
import GetUserResponse from "../../model/response/user/GetUserResponse";
import ErrorResponse from "../../model/response/ErrorResponse";

const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080";

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [userNews, setUserNews] = useState<any[]>([]);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean, newsId: string | null }>({
    show: false,
    newsId: null
  });
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
          fetchUserNews(token, userData.id);
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

  // Fetch user news using the paged endpoint
  const fetchUserNews = async (token: string, userId: string) => {
    setNewsLoading(true);
    try {
      const response = await getUserNewsPaged(token, userId, 0, 10);
      if (response && response.newsList) {
        setUserNews(response.newsList);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch news articles");
    } finally {
      setNewsLoading(false);
    }
  };
  
  // Handle opening the delete confirmation dialog
  const handleDeleteClick = (newsId: string) => {
    setDeleteConfirmation({
      show: true,
      newsId: newsId
    });
  };

  // Handle actually deleting the news after confirmation
  const handleDeleteNews = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first");
      navigate("/sign-in");
      return;
    }
    
    try {
      await deleteNews(token, id);
      toast.success("News article successfully deleted");
      
      // Update the news list by removing the deleted item
      setUserNews(prevNews => prevNews.filter(news => news.id !== id));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete news article");
    }
  };
  
  // Execute the delete when confirmed
  const confirmDelete = async () => {
    if (deleteConfirmation.newsId) {
      await handleDeleteNews(deleteConfirmation.newsId);
    }
    // Reset the confirmation state
    setDeleteConfirmation({ show: false, newsId: null });
  };
  
  const filteredNews = filter === "all" 
    ? userNews 
    : userNews.filter(item => (item.status || '').toLowerCase() === filter.toLowerCase());

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
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.show}
        onClose={() => setDeleteConfirmation({ show: false, newsId: null })}
        onConfirm={confirmDelete}
        title="Delete News Article"
        message="Are you sure you want to delete this news article? This action cannot be undone."
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        type="danger"
        darkMode={darkMode}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* User profile section */}
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
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              
              <div className="mt-16 flex flex-col md:flex-row md:justify-between md:items-end">
                <div>
                  <h1 className={`text-2xl font-bold mb-1 ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>{user.name}</h1>
                  <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                    {user.email}
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <Link 
                    to="/user/settings"
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* News section */}
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
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
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
        
        {/* News list */}
        {newsLoading ? (
          <div className="py-20 flex justify-center">
            <div className="flex flex-col items-center">
              <Loader className={`w-10 h-10 animate-spin mb-4 ${
                darkMode ? 'text-indigo-400' : 'text-indigo-600'
              }`} />
              <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                Loading your news articles...
              </p>
            </div>
          </div>
        ) : filteredNews.length > 0 ? (
          <NewsCarousel darkMode={darkMode}>
            {filteredNews.map((item) => (
              <NewsCard 
                key={item.id} 
                news={item} 
                darkMode={darkMode} 
                onDelete={handleDeleteNews}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </NewsCarousel>
        ) : (
          <div className={`rounded-xl border p-10 text-center ${
            darkMode 
              ? 'bg-slate-900 border-slate-800 text-slate-400' 
              : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <PlusCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h3 className="text-xl font-medium mb-2">No news articles found</h3>
            <p className="mb-6">You haven't uploaded any news articles yet.</p>
            <Link 
              to="/user/upload"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Upload Your First Article
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfilePage;