
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Membership {
  id: string;
  user_id: string;
  status: 'free' | 'paid' | 'expired';
  payment_reference: string | null;
  amount: number | null;
  currency: string | null;
  payment_method: string | null;
  paid_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useMembership = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['membership', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching membership:', error);
        throw error;
      }
      
      return data as Membership | null;
    },
    enabled: !!user
  });
};

export const useInitiateMpesaPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phoneNumber, userId }: { phoneNumber: string; userId: string }) => {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phoneNumber,
          amount: 800, // KES 800
          userId
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Refetch membership data
      queryClient.invalidateQueries({ queryKey: ['membership'] });
    }
  });
};

export const useCheckPaymentStatus = () => {
  return useMutation({
    mutationFn: async (checkoutRequestId: string) => {
      // This would typically check the payment status
      // For now, we'll just refetch the membership
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('status')
        .eq('checkout_request_id', checkoutRequestId)
        .single();

      if (error) throw error;
      return data;
    }
  });
};
