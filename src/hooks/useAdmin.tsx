
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
      const [
        usersResult, 
        activeUsersResult, 
        bannedUsersResult, 
        escortsResult, 
        activeEscortsResult, 
        bookingsResult, 
        pendingVerificationsResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('is_active', true).eq('is_banned', false),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('is_banned', true),
        supabase.from('escort_profiles').select('id', { count: 'exact' }),
        supabase.from('escort_profiles').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('bookings').select('id, total_amount', { count: 'exact' }),
        supabase.from('escort_profiles').select('id').eq('verified', false).eq('is_active', true)
      ]);

      const totalRevenue = bookingsResult.data?.reduce((sum, booking) => sum + Number(booking.total_amount), 0) || 0;

      return {
        totalUsers: usersResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        bannedUsers: bannedUsersResult.count || 0,
        totalEscorts: escortsResult.count || 0,
        activeEscorts: activeEscortsResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        totalRevenue,
        pendingVerifications: pendingVerificationsResult.data?.length || 0
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
