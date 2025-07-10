
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EscortProfile {
  id: string;
  user_id: string;
  stage_name: string;
  bio: string | null;
  age: number | null;
  category: string | null;
  services_offered: string[] | null;
  hourly_rate: number | null;
  availability_status: 'available' | 'busy' | 'offline';
  location: string | null;
  verified: boolean;
  rating: number;
  total_reviews: number;
  profile_image_url: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

// Validate price range for KES 500-10000
export const validateHourlyRate = (rate: number): boolean => {
  return rate >= 500 && rate <= 10000;
};

export const formatCurrency = (amount: number): string => {
  return `KES ${amount.toLocaleString()}`;
};

export const useEscorts = () => {
  return useQuery({
    queryKey: ['escorts'],
    queryFn: async () => {
      // Only fetch verified profiles for public listing
      const { data, error } = await supabase
        .from('escort_profiles')
        .select('*')
        .eq('verified', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data as EscortProfile[];
    }
  });
};

export const useSearchEscorts = (location?: string, category?: string) => {
  return useQuery({
    queryKey: ['escorts', 'search', location, category],
    queryFn: async () => {
      let query = supabase
        .from('escort_profiles')
        .select('*')
        .eq('verified', true); // Only show verified profiles

      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query
        .order('rating', { ascending: false });

      if (error) throw error;
      return data as EscortProfile[];
    },
    enabled: !!(location || category)
  });
};
