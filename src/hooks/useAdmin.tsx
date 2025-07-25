
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalEscorts: number;
  activeEscorts: number;
  totalBookings: number;
  totalRevenue: number;
  pendingVerifications: number;
}

export interface ActivityLog {
  id: string;
  admin_id: string | null;
  action_type: string;
  target_type: string;
  target_id: string | null;
  description: string;
  metadata: any;
  created_at: string;
}

export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  updated_by: string | null;
  updated_at: string;
}

export const useAdminCheck = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data?.is_admin || false;
    },
    enabled: !!user?.id
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get user counts
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, is_active, is_banned');
        
      if (usersError) throw usersError;

      const totalUsers = allUsers?.length || 0;
      const activeUsers = allUsers?.filter(user => user.is_active)?.length || 0;
      const bannedUsers = allUsers?.filter(user => user.is_banned)?.length || 0;

      // Get escort counts
      const { data: allEscorts, error: escortsError } = await supabase
        .from('escort_profiles')
        .select('id, is_active');
        
      if (escortsError) throw escortsError;

      const totalEscorts = allEscorts?.length || 0;
      const activeEscorts = allEscorts?.filter(escort => escort.is_active)?.length || 0;

      // Get booking stats
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, total_amount');
        
      if (bookingsError) throw bookingsError;

      const totalBookings = bookings?.length || 0;
      const totalRevenue = bookings?.reduce((sum, booking) => sum + Number(booking.total_amount), 0) || 0;

      // Get pending verifications
      const { data: pendingEscorts, error: pendingError } = await supabase
        .from('escort_profiles')
        .select('id')
        .eq('verified', false);
        
      if (pendingError) throw pendingError;

      const pendingVerifications = pendingEscorts?.length || 0;

      return {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalEscorts,
        activeEscorts,
        totalBookings,
        totalRevenue,
        pendingVerifications
      } as AdminStats;
    }
  });
};

export const useActivityLogs = () => {
  return useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return data as ActivityLog[];
    }
  });
};

export const usePlatformSettings = () => {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('setting_key');
        
      if (error) throw error;
      return data as PlatformSetting[];
    }
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data, error } = await supabase
        .from('platform_settings')
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq('setting_key', key)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    }
  });
};

export const useLogActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ action_type, target_type, target_id, description, metadata }: {
      action_type: string;
      target_type: string;
      target_id?: string;
      description: string;
      metadata?: any;
    }) => {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .insert({
          action_type,
          target_type,
          target_id,
          description,
          metadata
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    }
  });
};
