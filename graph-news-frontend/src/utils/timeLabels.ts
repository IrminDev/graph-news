/**
 * Formats a date string into a human-readable format
 * @param dateString ISO date string
 * @returns Formatted date string with month, day, year, hour and minute
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Returns a user-friendly time label based on when the content was created
 * @param dateString ISO date string
 * @returns A friendly time label (Today, This Week, This Month, or Long Ago)
 */
export const getTimeLabel = (dateString?: string): string => {
  if (!dateString) return "Unknown";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays <= 7) {
    return "This Week";
  } else if (diffDays <= 30) {
    return "This Month";
  } else if (diffDays <= 90) {
    return "Recent";
  } else {
    return "Archive";
  }
};

/**
 * Returns the appropriate CSS classes for time labels based on recency
 * @param timeLabel The time label to style
 * @param darkMode Whether dark mode is enabled
 * @returns CSS class string
 */
export const getTimeLabelClasses = (timeLabel: string, darkMode: boolean): string => {
  switch (timeLabel) {
    case 'Today':
      return darkMode 
        ? 'bg-green-900/30 text-green-400' 
        : 'bg-green-100 text-green-800';
    case 'Yesterday':
      return darkMode 
        ? 'bg-yellow-900/30 text-yellow-400' 
        : 'bg-yellow-100 text-yellow-800';
    case 'This Week':
      return darkMode 
        ? 'bg-blue-900/30 text-blue-400' 
        : 'bg-blue-100 text-blue-800';
    case 'This Month':
      return darkMode 
        ? 'bg-purple-900/30 text-purple-400' 
        : 'bg-purple-100 text-purple-800';
    case 'Recent':
      return darkMode 
        ? 'bg-amber-900/30 text-amber-400' 
        : 'bg-amber-100 text-amber-800';
    default: // Archive
      return darkMode 
        ? 'bg-slate-800 text-slate-300' 
        : 'bg-slate-200 text-slate-700';
  }
};