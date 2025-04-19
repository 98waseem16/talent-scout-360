
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
 * Formats expiration date info into a human-readable format
 */
export const formatExpirationDate = (expirationDate: string | undefined): string => {
  if (!expirationDate) return 'No expiration date';
  
  const now = new Date();
  const expiration = new Date(expirationDate);
  
  // If date is invalid
  if (isNaN(expiration.getTime())) {
    return 'Invalid date';
  }
  
  const diffTime = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'Expired';
  } else if (diffDays === 0) {
    return 'Expires today';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else if (diffDays < 7) {
    return `Expires in ${diffDays} days`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 
      ? 'Expires in 1 week' 
      : `Expires in ${weeks} weeks`;
  } else {
    const months = Math.floor(diffDays / 30);
    return months === 1 
      ? 'Expires in 1 month' 
      : `Expires in ${months} months`;
  }
};

/**
 * Calculates days until expiration from an expiration date string
 */
export const getDaysUntilExpiration = (expirationDate: string | undefined): number | null => {
  if (!expirationDate) return null;
  
  const now = new Date();
  const expiration = new Date(expirationDate);
  
  // If date is invalid
  if (isNaN(expiration.getTime())) {
    return null;
  }
  
  const diffTime = expiration.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Generates a default expiration date 30 days from now
 */
export const getDefaultExpirationDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
};
