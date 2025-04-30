import React, { useState, useEffect } from "react";
import { PlusCircle, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import userService from "../../services/user.service";
import { 
  getUserNewsPaged, 
  deleteNews, 
  getUserNewsByDateRange 
} from "../../services/news.service";
import UserHeader from "../../components/user/UserHeader";
import Loading from "../../components/Loading";
import NewsCard from "../../components/news/NewsCard";
import DialogBox from "../../components/DialogBox";
import NewsCarousel from "../../components/news/NewsCarousel";
import TimeFilterSelect from "../../components/news/TimeFilterSelect";
import GetUserResponse from "../../model/response/user/GetUserResponse";
import ErrorResponse from "../../model/response/ErrorResponse";
import News from "../../model/News";
import { NewsFilterOption, getDateRangeForFilter } from "../../utils/newsFilters";

const API_URL = import.meta.env.VITE_API_URL as string || "http://localhost:8080";

/**
 * User profile page component that displays user information and their news articles
 * with filtering capabilities
 */
const UserProfilePage: React.FC = () => {
  // Navigation
  const navigate = useNavigate();
  
  // Theme state
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  
  // User data state
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
  });
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  
  // News state
  const [newsArticles, setNewsArticles] = useState<News[]>([]);
  const [newsFilter, setNewsFilter] = useState<NewsFilterOption>('all');
  
  // Loading states
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Confirmation dialog state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ 
    isOpen: boolean, 
    newsId: string | null 
  }>({
    isOpen: false,
    newsId: null
  });


  // Apply dark mode changes to the document
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
  
  // Fetch user profile data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first");
      navigate("/sign-in");
      return;
    }

    userService.getMe(token)
      .then((response: GetUserResponse) => {
        const userData = {
          id: response.user.id || "",
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
        };
        
        setUser(userData);
        
        // Once we have the user ID, check for profile image and fetch news
        if (userData.id) {
          fetchUserProfileImage(userData.id);
          fetchUserNewsArticles(token, userData.id);
        } else {
          setIsImageLoaded(true);
        }
        
        setIsUserLoading(false);
      })
      .catch((error: ErrorResponse) => {
        toast.error(error.message);
        navigate("/sign-in");
      });
  }, [navigate]);

  // Refetch news articles when filter changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user.id) {
      fetchUserNewsArticles(token, user.id);
    }
  }, [newsFilter, user.id]);
  
  // Fetch user profile image if available
  const fetchUserProfileImage = (userId: string) => {
    // Use timestamp to prevent caching
    const timestamp = new Date().getTime();
    const imageUrl = `${API_URL}/api/user/image/${userId}?t=${timestamp}`;
    
    // Create an image element to test if the image exists
    const img = new Image();
    img.onload = () => {
      setUserImageUrl(imageUrl);
      setIsImageLoaded(true);
    };
    img.onerror = () => {
      setUserImageUrl(null);
      setIsImageLoaded(true);
    };
    img.src = imageUrl;
  };

  // Fetch user's news articles with optional date filtering
  const fetchUserNewsArticles = async (token: string, userId: string) => {
    setIsNewsLoading(true);
    
    try {
      let response;
      
      if (newsFilter === 'all') {
        // Fetch all news without date filtering
        response = await getUserNewsPaged(token, userId, 0, 10);
      } else {
        // Apply date range filter
        const [startDate, endDate] = getDateRangeForFilter(newsFilter);
        response = await getUserNewsByDateRange(token, userId, startDate, endDate, 0, 10);
      }
      
      if (response && response.newsList) {
        setNewsArticles(response.newsList);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch news articles");
    } finally {
      setIsNewsLoading(false);
    }
  };
  
  // Open confirmation dialog for news deletion
  const showDeleteConfirmation = (newsId: string) => {
    setDeleteConfirmation({
      isOpen: true,
      newsId: newsId
    });
  };

  // Close confirmation dialog
  const hideDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      newsId: null
    });
  };
  
  // Delete a news article after confirmation
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
      setNewsArticles(prevNews => prevNews.filter(news => news.id.toString() !== id));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete news article");
    }
  };
  
  // Execute news deletion after confirmation
  const confirmNewsDelete = async () => {
    if (deleteConfirmation.newsId) {
      await handleDeleteNews(deleteConfirmation.newsId);
    }
    hideDeleteConfirmation();
  };
  
  // Show loading indicator while data is being fetched
  if (isUserLoading || !isImageLoaded) {
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
      <DialogBox
        isOpen={deleteConfirmation.isOpen}
        onClose={hideDeleteConfirmation}
        onConfirm={confirmNewsDelete}
        title="Delete News Article"
        message="Are you sure you want to delete this news article? This action cannot be undone."
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        type="danger"
        darkMode={darkMode}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* User profile section */}
        <UserProfileHeader 
          user={user}
          userImageUrl={userImageUrl}
          darkMode={darkMode}
        />
        
        {/* News section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className={`text-2xl font-bold mb-4 md:mb-0 ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>Your News Uploads</h2>
            
            <div className="flex space-x-2 items-center">
              <TimeFilterSelect
                value={newsFilter}
                onChange={(value) => setNewsFilter(value)}
                darkMode={darkMode}
              />
              
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
        <UserNewsDisplay 
          newsArticles={newsArticles}
          isLoading={isNewsLoading}
          darkMode={darkMode}
          onDeleteClick={showDeleteConfirmation}
          onDelete={handleDeleteNews}
        />
      </main>
    </div>
  );
};

/**
 * Profile header section component
 */
const UserProfileHeader: React.FC<{
  user: { name: string, email: string },
  userImageUrl: string | null,
  darkMode: boolean
}> = ({ user, userImageUrl, darkMode }) => (
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
);

/**
 * News display component handling both loading and content states
 */
const UserNewsDisplay: React.FC<{
  newsArticles: News[],
  isLoading: boolean,
  darkMode: boolean,
  onDeleteClick: (id: string) => void,
  onDelete: (id: string) => Promise<void>
}> = ({ newsArticles, isLoading, darkMode, onDeleteClick, onDelete }) => {
  if (isLoading) {
    return (
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
    );
  }
  
  if (newsArticles.length === 0) {
    return (
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
          Upload an Article
        </Link>
      </div>
    );
  }
  
  return (
    <NewsCarousel darkMode={darkMode}>
      {newsArticles.map((article) => (
        <NewsCard 
          key={article.id} 
          news={article} 
          darkMode={darkMode} 
          onDelete={onDelete}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </NewsCarousel>
  );
};

export default UserProfilePage;