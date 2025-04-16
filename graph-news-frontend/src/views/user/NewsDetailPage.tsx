import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Trash2, Network, Calendar,
  User, MessageCircle, FileText 
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import UserHeader from "../../components/user/UserHeader";
import Loading from "../../components/Loading";
import DialogBox from "../../components/DialogBox";
import userService from "../../services/user.service";
import { getNewsById, deleteNews } from "../../services/news.service";
import GetUserResponse from "../../model/response/user/GetUserResponse";
import ErrorResponse from "../../model/response/ErrorResponse";
import NewsResponse from "../../model/response/news/NewsResponse";
import News from "../../model/News";
import { getTimeLabel, getTimeLabelClasses, formatDate } from "../../utils/timeLabels";

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [news, setNews] = useState<News | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

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
  
  // Fetch user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first");
      navigate("/sign-in");
      return;
    }
    
    // Fetch the user data
    userService.getMe(token)
      .then((data: GetUserResponse) => {
        setUser({
          id: data.user.id || "",
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        });
        
        // After user is loaded, fetch news details
        if (id) {
          getNewsById(id)
            .then((response: NewsResponse) => {
              setNews(response.news);
              setLoading(false);
            })
            .catch((error: ErrorResponse) => {
              toast.error(error.message || "Failed to load news article");
              navigate("/user/profile");
            });
        }
      })
      .catch((error: ErrorResponse) => {
        toast.error(error.message);
        navigate("/sign-in");
      });
  }, [id, navigate]);
  
  const openDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };
  
  const closeDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
  };
  
  const confirmDelete = async () => {
    if (!id) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first");
      navigate("/sign-in");
      return;
    }
    
    setDeleting(true);
    
    try {
      await deleteNews(token, id);
      toast.success("News article successfully deleted");
      navigate("/user/profile");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete news article");
      setDeleting(false);
    }
  };
  
  const handleViewGraph = () => {
    // Reserved for future implementation of knowledge graph visualization
    toast.info("Knowledge graph visualization will be available in a future update");
  };
  
  if (loading || !news) {
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
        activeTab="" 
      />
      
      {/* Delete Confirmation Dialog */}
      <DialogBox
        isOpen={showDeleteConfirmation}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDelete}
        title="Delete News Article"
        message="Are you sure you want to delete this news article? This action cannot be undone."
        confirmButtonText={deleting ? "Deleting..." : "Delete"}
        cancelButtonText="Cancel"
        type="danger"
        darkMode={darkMode}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className={`inline-flex items-center transition-colors ${
                darkMode 
                  ? 'text-slate-300 hover:text-white' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>
          
          <div className={`rounded-xl border transition-colors duration-500 overflow-hidden ${
            darkMode 
              ? 'bg-slate-900 border-slate-800' 
              : 'bg-white border-slate-200'
          }`}>
            {/* News Header */}
            <div className={`p-6 border-b ${
              darkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`text-2xl md:text-3xl font-bold mb-2 ${
                      darkMode ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {news.title}
                  </motion.h1>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-2">
                    <div className={`flex items-center ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      <Calendar className="w-4 h-4 mr-1.5" />
                      <span className="text-sm">
                        {formatDate(news.createdAt || new Date().toISOString())}
                      </span>
                    </div>
                    
                    <div className={`flex items-center ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      <User className="w-4 h-4 mr-1.5" />
                      <span className="text-sm">
                        {news.author?.name || "Unknown Author"}
                      </span>
                    </div>
                    
                    {/* Time-based label */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getTimeLabelClasses(getTimeLabel(news.createdAt), darkMode)
                    }`}>
                      {getTimeLabel(news.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleViewGraph}
                    className={`px-3 py-2 rounded-lg flex items-center transition-colors ${
                      darkMode 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <Network className="w-4 h-4 mr-2" />
                    View Graph
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openDeleteConfirmation}
                    disabled={deleting}
                    className={`px-3 py-2 rounded-lg flex items-center transition-colors ${
                      darkMode 
                        ? 'bg-red-900/60 hover:bg-red-800 text-white' 
                        : 'bg-red-100 hover:bg-red-200 text-red-700'
                    } ${deleting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* News Content */}
            <div className="p-6">
              {news.content ? (
                <div className={`prose max-w-none ${
                  darkMode ? 'prose-invert' : ''
                }`}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {news.content.split('\n').map((paragraph: string, idx: number) => (
                      paragraph.trim() ? (
                        <p key={idx} className={`mb-4 ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {paragraph}
                        </p>
                      ) : <br key={idx} />
                    ))}
                  </motion.div>
                </div>
              ) : (
                <div className={`p-4 rounded-lg border flex items-center ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-400' 
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <FileText className="w-5 h-5 mr-3 flex-shrink-0" />
                  <p>
                    No content available for this news article.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Related News Section (placeholder for future implementation) */}
          <div className="mt-8">
            <h2 className={`text-xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>
              Related News
            </h2>
            
            <div className={`rounded-lg border p-8 text-center ${
              darkMode 
                ? 'bg-slate-900 border-slate-800' 
                : 'bg-white border-slate-200'
            }`}>
              <MessageCircle className={`w-10 h-10 mx-auto mb-3 ${
                darkMode ? 'text-slate-700' : 'text-slate-300'
              }`} />
              <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                Related articles based on knowledge graph connections will appear here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewsDetailPage;