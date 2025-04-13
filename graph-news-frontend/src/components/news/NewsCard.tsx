import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowUpRight, Trash2, Network, Loader } from "lucide-react";
import { Link } from "react-router-dom";

interface NewsCardProps {
  news: any;
  darkMode: boolean;
  onDelete: (id: string) => Promise<void>;
  onDeleteClick: (id: string) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, darkMode, onDeleteClick }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
 
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDeleteClick(news.id);
  };
  
  const status = news.status || "Processing";
  const category = news.category || "Uncategorized";

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
            <Link 
              to={`/user/news/${news.id}#graph`}
              className={`p-1.5 rounded-full transition-colors ${
                darkMode ? 'text-slate-400 hover:bg-indigo-900/30 hover:text-indigo-400' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
              title="View Knowledge Graph"
            >
              <Network className="w-4 h-4" />
            </Link>
            <button 
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className={`p-1.5 rounded-full transition-colors ${
                darkMode ? 'text-slate-400 hover:bg-red-900/30 hover:text-red-400' : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
              }`}
              title="Delete"
            >
              {isDeleting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        
        <p className={`mb-3 line-clamp-2 ${
          darkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {news.content 
            ? news.content.substring(0, 120) + (news.content.length > 120 ? '...' : '')
            : "No content available."}
        </p>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-1">
            <Calendar className={`w-4 h-4 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <span className={`text-xs ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {news.createdAt ? formatDate(news.createdAt) : "No date"}
            </span>
          </div>
          
          <div className="flex items-center">
            {news.url && (
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
            )}
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
            {category}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            status.toLowerCase() === 'completed'
              ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
              : darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-800'
          }`}>
            {status}
          </div>
        </div>
        
        <Link 
          to={`/user/news/${news.id}`}
          className={`text-sm font-medium ${
            darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
          }`}
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default NewsCard;