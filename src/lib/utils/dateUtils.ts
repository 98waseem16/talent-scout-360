
/**
 * Formats a date string into a human-readable relative time format
 */
export const formatPostedDate = (postedDate: string): string => {
  const now = new Date();
  const posted = new Date(postedDate);
  const diffTime = Math.abs(now.getTime() - posted.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
};

/**
 * Calculates and formats the days remaining until expiration
 */
export const formatDaysRemaining = (expiresAt: string): string => {
  const now = new Date();
  const expirationDate = new Date(expiresAt);
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return 'Expired';
  } else if (diffDays === 1) {
    return '1 day left';
  } else {
    return `${diffDays} days left`;
  }
};
