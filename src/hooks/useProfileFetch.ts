
import { supabase } from '@/integrations/supabase/client';

export const useProfileFetch = () => {
  const fetchProfile = async (userId: string) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      // Cache profile data 
      localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Try to get from cache if network request failed
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        try {
          return JSON.parse(cachedProfile);
        } catch (e) {
          // Invalid cached data
          localStorage.removeItem(`profile_${userId}`);
        }
      }
      
      return null;
    }
  };

  return { fetchProfile };
};
