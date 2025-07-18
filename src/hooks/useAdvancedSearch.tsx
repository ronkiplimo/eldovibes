
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EscortProfile } from './useEscorts';

interface SearchFilters {
  location?: string;
  category?: string;
  minAge?: number;
  maxAge?: number;
  minRate?: number;
  maxRate?: number;
  verifiedOnly?: boolean;
  availableOnly?: boolean;
  services?: string[];
  searchName?: string;
}

export const useAdvancedSearch = (filters: SearchFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['escorts', 'advanced-search', filters],
    queryFn: async () => {
      let query = supabase
        .from('escort_profiles')
        .select('*');

      // Location filter
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      // Category filter
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Name search filter - case insensitive
      if (filters.searchName) {
        query = query.ilike('stage_name', `%${filters.searchName}%`);
      }

      // Age filters
      if (filters.minAge !== undefined) {
        query = query.gte('age', filters.minAge);
      }
      if (filters.maxAge !== undefined) {
        query = query.lte('age', filters.maxAge);
      }

      // Rate filters
      if (filters.minRate !== undefined) {
        query = query.gte('hourly_rate', filters.minRate);
      }
      if (filters.maxRate !== undefined) {
        query = query.lte('hourly_rate', filters.maxRate);
      }

      // Verified filter
      if (filters.verifiedOnly) {
        query = query.eq('verified', true);
      }

      // Available filter
      if (filters.availableOnly) {
        query = query.eq('availability_status', 'available');
      }

      // Services filter
      if (filters.services && filters.services.length > 0) {
        query = query.overlaps('services_offered', filters.services);
      }

      const { data, error } = await query
        .order('rating', { ascending: false });

      if (error) throw error;
      return data as EscortProfile[];
    },
    enabled
  });
};
