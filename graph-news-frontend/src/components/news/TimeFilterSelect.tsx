import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { NewsFilterOption, getFilterLabel } from '../../utils/newsFilters';

interface TimeFilterSelectProps {
  value: NewsFilterOption;
  onChange: (value: NewsFilterOption) => void;
  darkMode: boolean;
}

const TimeFilterSelect: React.FC<TimeFilterSelectProps> = ({ 
  value, 
  onChange, 
  darkMode 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Options array for easier mapping
  const options: NewsFilterOption[] = [
    'all', 'today', 'yesterday', 'this-week', 'this-month', 'recent', 'archive'
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelection = (option: NewsFilterOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div 
      className="relative"
      ref={dropdownRef}
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between min-w-[180px] px-3 py-2 rounded-lg border cursor-pointer transition-colors duration-500 ${
          darkMode 
            ? 'bg-slate-900 border-slate-800 hover:border-slate-700' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center">
          <Filter className={`w-4 h-4 mr-2 ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`} />
          <span className={`text-sm ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {getFilterLabel(value)}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${
          isOpen ? 'transform rotate-180' : ''
        } ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
      </div>

      {isOpen && (
        <div 
          className={`absolute z-50 left-0 right-0 mt-1 rounded-lg border shadow-lg overflow-hidden ${
            darkMode 
              ? 'bg-slate-900 border-slate-700' 
              : 'bg-white border-slate-200'
          }`}
        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleSelection(option)}
              className={`px-3 py-2 cursor-pointer transition-colors ${
                value === option
                  ? darkMode 
                    ? 'bg-indigo-900/50 text-indigo-300' 
                    : 'bg-indigo-50 text-indigo-900'
                  : darkMode 
                    ? 'text-white hover:bg-slate-800' 
                    : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              {getFilterLabel(option)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeFilterSelect;