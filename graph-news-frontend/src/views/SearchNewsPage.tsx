import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, Loader, AlertCircle, ArrowLeft, 
  ArrowRight, Network
} from "lucide-react";
import { toast } from "react-toastify";
import UserHeader from "../components/user/UserHeader";
import userService from "../services/user.service";
import { searchNews } from "../services/news.service";
import GetUserResponse from "../model/response/user/GetUserResponse";
import ErrorResponse from "../model/response/ErrorResponse";
import News from "../model/News";
import { formatDate } from "../utils/timeLabels";

const SearchNewsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '0');

  // Component state
  const [query, setQuery] = useState(currentQuery);
  const [results, setResults] = useState<News[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  const resultsPerPage = 10;

  // Apply dark mode changes
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
      setInitialLoading(false);
      return;
    }

    userService.getMe(token)
      .then((data: GetUserResponse) => {
        setUser({
          id: data.user.id || "",
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        });
        setInitialLoading(false);
      })
      .catch((error: ErrorResponse) => {
        console.error("Failed to fetch user data:", error);
        setInitialLoading(false);
      });
  }, []);

  // Fetch search results when query or page changes
  useEffect(() => {
    if (currentQuery) {
      performSearch(currentQuery, currentPage);
    } else {
      setInitialLoading(false);
    }
  }, [currentQuery, currentPage]);

  const performSearch = async (searchQuery: string, page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await searchNews(token || "", searchQuery, page, resultsPerPage);
      
      if (response && response.newsList) {
        setResults(response.newsList);
        setTotalResults(response.total || response.newsList.length);
      } else {
        setResults([]);
        setTotalResults(0);
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while searching");
      toast.error(error.message || "Failed to search news");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim(), page: '0' });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage * resultsPerPage < totalResults) {
      setSearchParams({ q: currentQuery, page: newPage.toString() });
    }
  };

  if (initialLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        darkMode 
          ? 'bg-gradient-to-r from-slate-900 to-indigo-950' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-100'
      }`}>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full border-indigo-500 animate-spin"></div>
        </div>
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
        activeTab="search" 
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`mb-8 rounded-xl border overflow-hidden transition-colors duration-500 ${
              darkMode 
                ? 'bg-slate-900 border-slate-800' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="p-6">
                <h1 className={`text-2xl md:text-3xl font-bold mb-6 ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  Search News Articles
                </h1>

                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter keywords to search..."
                    className={`flex-grow rounded-lg px-4 py-3 outline-none focus:ring-2 transition-colors ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg flex items-center justify-center transition-colors ${
                      darkMode
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Search
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Search Results */}
          <div>
            {error ? (
              <div className={`p-6 rounded-xl border text-center transition-colors duration-500 ${
                darkMode
                  ? 'bg-red-900/20 border-red-900/30 text-red-300'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-70" />
                <h3 className="text-xl font-medium mb-2">Error</h3>
                <p>{error}</p>
              </div>
            ) : currentQuery ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    {loading ? 'Searching...' : `Results for "${currentQuery}"`}
                  </h2>
                  <p className={`text-sm ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {totalResults} results found
                  </p>
                </div>

                {results.length > 0 ? (
                  <div className="space-y-4">
                    {results.map((news, index) => (
                      <NewsSearchResult 
                        key={news.id} 
                        news={news} 
                        darkMode={darkMode}
                        animationDelay={index * 0.1}
                      />
                    ))}
                  </div>
                ) : !loading ? (
                  <div className={`p-8 rounded-xl border text-center transition-colors duration-500 ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <h3 className="text-xl font-medium mb-2">No results found</h3>
                    <p>Try different keywords or broaden your search</p>
                  </div>
                ) : null}

                {/* Pagination */}
                {results.length > 0 && totalResults > resultsPerPage && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`p-2 rounded-lg transition-colors ${
                          currentPage === 0 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        } ${
                          darkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      
                      <div className={`px-4 py-2 ${
                        darkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        Page {currentPage + 1} of {Math.ceil(totalResults / resultsPerPage)}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={(currentPage + 1) * resultsPerPage >= totalResults}
                        className={`p-2 rounded-lg transition-colors ${
                          (currentPage + 1) * resultsPerPage >= totalResults
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        } ${
                          darkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-12 rounded-xl border text-center transition-colors duration-500 ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}>
                <Search className={`w-16 h-16 mx-auto mb-4 ${
                  darkMode ? 'text-slate-700' : 'text-slate-300'
                }`} />
                <h3 className={`text-xl font-medium mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  Search for News Articles
                </h3>
                <p className={`max-w-md mx-auto mb-6 ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Enter keywords to search for news articles. You can search by title, content, 
                  or entities mentioned in the articles.
                </p>
                
                <div className="max-w-md mx-auto">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter keywords to search..."
                      className={`flex-grow rounded-lg px-4 py-3 outline-none focus:ring-2 transition-colors ${
                        darkMode
                          ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500'
                      }`}
                    />
                    <button
                      type="submit"
                      className={`px-6 py-3 rounded-lg flex items-center justify-center transition-colors ${
                        darkMode
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// News search result component
const NewsSearchResult: React.FC<{
  news: News;
  darkMode: boolean;
  animationDelay: number;
}> = ({ news, darkMode, animationDelay }) => {
  const navigate = useNavigate();
  
  const viewNewsDetails = () => {
    navigate(`/user/news/${news.id}`);
  };
  
  const viewNewsGraph = () => {
    navigate(`/graph/${news.id}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-md ${
        darkMode 
          ? 'bg-slate-900 border-slate-800 hover:shadow-indigo-500/5' 
          : 'bg-white border-slate-200 hover:shadow-slate-300/30'
      }`}
    >
      <div className="p-6">
        <h3 
          className={`text-xl font-semibold mb-2 cursor-pointer hover:underline ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}
          onClick={viewNewsDetails}
        >
          {news.title}
        </h3>
        
        <p className={`mb-4 line-clamp-2 ${
          darkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {news.content || "No content available for this news article."}
        </p>
        
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className={`text-sm ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {news.createdAt ? formatDate(news.createdAt) : "No date available"}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={viewNewsGraph}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors ${
                darkMode 
                  ? 'bg-indigo-900/50 hover:bg-indigo-800 text-indigo-300' 
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
              }`}
            >
              <Network className="w-3.5 h-3.5 mr-1.5" />
              View Graph
            </button>
            
            <button
              onClick={viewNewsDetails}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors ${
                darkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchNewsPage;