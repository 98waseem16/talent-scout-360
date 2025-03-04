
import { useState } from 'react';
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
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  return { fetchProfile };
};
