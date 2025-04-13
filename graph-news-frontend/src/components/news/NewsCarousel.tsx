import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import NewsCarouselProps from '../../model/NewsCarouselProps';

const NewsCarousel: React.FC<NewsCarouselProps> = ({ children, itemsPerPage = 3, darkMode }) => {
  const [page, setPage] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(itemsPerPage);
  
  // Calculate total pages
  const totalItems = children.length;
  const totalPages = Math.ceil(totalItems / itemsToShow);
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(1);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2);
      } else {
        setItemsToShow(itemsPerPage);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerPage]);
  
  // Update page if needed when items per page changes
  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [itemsToShow, page, totalPages]);

  const nextPage = () => {
    setPage(prevPage => Math.min(prevPage + 1, totalPages - 1));
  };

  const prevPage = () => {
    setPage(prevPage => Math.max(prevPage - 1, 0));
  };
  
  const getCurrentPageItems = () => {
    const startIndex = page * itemsToShow;
    return children.slice(startIndex, startIndex + itemsToShow);
  };

  // Don't render carousel controls if there's only one page
  if (totalPages <= 1) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center">
        <button 
          onClick={prevPage} 
          disabled={page === 0}
          className={`absolute left-0 z-10 p-2 rounded-full transform -translate-y-1/2 top-1/2 ${
            darkMode 
              ? 'bg-slate-800 text-white hover:bg-slate-700' 
              : 'bg-white text-slate-800 hover:bg-slate-100'
          } ${page === 0 ? 'opacity-50 cursor-not-allowed' : 'shadow-md'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="w-full overflow-hidden px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {getCurrentPageItems()}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <button 
          onClick={nextPage} 
          disabled={page === totalPages - 1}
          className={`absolute right-0 z-10 p-2 rounded-full transform -translate-y-1/2 top-1/2 ${
            darkMode 
              ? 'bg-slate-800 text-white hover:bg-slate-700' 
              : 'bg-white text-slate-800 hover:bg-slate-100'
          } ${page === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'shadow-md'}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Pagination indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => setPage(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              page === index
                ? darkMode ? 'bg-indigo-500' : 'bg-indigo-600'
                : darkMode ? 'bg-slate-700' : 'bg-slate-300'
            }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsCarousel;