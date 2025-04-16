import { getTimeLabel } from "./timeLabels";

/**
 * Filter options for news articles
 */
export type NewsFilterOption = 
  | 'all' 
  | 'today' 
  | 'yesterday' 
  | 'this-week' 
  | 'this-month' 
  | 'recent' 
  | 'archive';

/**
 * Get human-readable label for filter option
 */
export const getFilterLabel = (filter: NewsFilterOption): string => {
  switch (filter) {
    case 'all': return 'All Articles';
    case 'today': return 'Today';
    case 'yesterday': return 'Yesterday';
    case 'this-week': return 'This Week';
    case 'this-month': return 'This Month';
    case 'recent': return 'Recent (3 Months)';
    case 'archive': return 'Archive';
    default: return 'All Articles';
  }
};

/**
 * Get date range for a filter option
 * @returns [startDate, endDate] as ISO strings
 */
export const getDateRangeForFilter = (filter: NewsFilterOption): [string, string] => {
  const now = new Date();
  
  // Start with default end date (end of current day)
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);
  
  // Start with default start date (beginning of current day)
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  
  switch (filter) {
    case 'all':
      // No date filtering
      return ['', ''];
      
    case 'today':
      // There's nothing to do...
      return [startDate.toISOString(), endDate.toISOString()];
      
    case 'yesterday':
      // Move both dates back one day
      startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() - 1);
      return [startDate.toISOString(), endDate.toISOString()];
      
    case 'this-week':
      // Get current day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = startDate.getDay();
      // Go back to the beginning of the week (Sunday)
      startDate.setDate(startDate.getDate() - dayOfWeek);
      // Keep endDate as end of current day
      return [startDate.toISOString(), endDate.toISOString()];
      
    case 'this-month':
      // Go to first day of current month
      startDate.setDate(1);
      // Keep endDate as end of current day
      return [startDate.toISOString(), endDate.toISOString()];
      
    case 'recent':
      // Go back 90 days from today
      startDate.setDate(startDate.getDate() - 90);
      // Keep endDate as end of current day
      return [startDate.toISOString(), endDate.toISOString()];
      
    case 'archive':
      // Far back in the past (year 2000)
      startDate.setFullYear(2000);
      // End date is 91 days ago (just before "recent" starts)
      endDate.setDate(endDate.getDate() - 91);
      return [startDate.toISOString(), endDate.toISOString()];
      
    default:
      return ['', ''];
  }
};