
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckCircle, X, Eye, Phone, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLogActivity } from '@/hooks/useAdmin';

const EscortManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  const { data: escorts, isLoading } = useQuery({
    queryKey: ['admin-escorts', searchTerm],
    queryFn: async () => {
      // Use service role to bypass RLS for admin access
      const { data, error } = await supabase.rpc('get_all_escort_profiles_admin', {
        search_term: searchTerm || ''
      });
      
      if (error) {
        console.error('Admin escort fetch error:', error);
        // Fallback to regular query if RPC fails
        let query = supabase
          .from('escort_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (searchTerm) {
          query = query.ilike('stage_name', `%${searchTerm}%`);
        }

        const fallbackResult = await query;
        if (fallbackResult.error) throw fallbackResult.error;
        return fallbackResult.data;
      }
      
      return data;
    }
  });

  const verifyEscortMutation = useMutation({
    mutationFn: async ({ escortId, verified }: { escortId: string; verified: boolean }) => {
      const { error } = await supabase
        .from('escort_profiles')
        .update({ verified: !verified })
        .eq('id', escortId);
      
      if (error) throw error;
      return { escortId, newStatus: !verified };
    },
    onSuccess: ({ escortId, newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-escorts'] });
      logActivity.mutate({
        action_type: 'escort_verification',
        target_type: 'escort_profile',
        target_id: escortId,
        description: `${newStatus ? 'Verified' : 'Unverified'} escort profile`,
      });
      toast({
        title: 'Success',
        description: `Escort ${newStatus ? 'verified' : 'unverified'} successfully`
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update escort verification status',
        variant: 'destructive'
      });
    }
  });

  const adminOverrideMutation = useMutation({
    mutationFn: async ({ escortId }: { escortId: string }) => {
      const { error } = await supabase
        .from('escort_profiles')
        .update({ 
          verified: true,
          is_active: true 
        })
        .eq('id', escortId);
      
      if (error) throw error;
      return escortId;
    },
    onSuccess: (escortId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-escorts'] });
      logActivity.mutate({
        action_type: 'admin_override',
        target_type: 'escort_profile',
        target_id: escortId,
        description: 'Admin activated escort profile without payment verification',
      });
      toast({
        title: 'Success',
        description: 'Escort profile activated by admin override'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to activate escort profile',
        variant: 'destructive'
      });
    }
  });

  const getAvailabilityBadge = (status: string) => {
    const colors = {
      available: 'bg-green-500',
      busy: 'bg-yellow-500',
      offline: 'bg-gray-500'
    };
    return (
      <Badge className={`${colors[status as keyof typeof colors]} text-white`}>
        {status}
      </Badge>
    );
  };

  const verifiedEscorts = escorts?.filter(escort => escort.verified) || [];
  const pendingEscorts = escorts?.filter(escort => !escort.verified) || [];

  const renderEscortCard = (escort: any, isPending = false) => (
    <div key={escort.id} className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{escort.stage_name}</h3>
            {escort.verified ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                Pending Payment
              </Badge>
            )}
            {getAvailabilityBadge(escort.availability_status)}
            {escort.category && <Badge variant="outline">{escort.category}</Badge>}
          </div>
          <div className="text-sm text-gray-600">
            <p>Age: {escort.age || 'Not specified'} | Rate: ${escort.hourly_rate}/hr</p>
            <p>Location: {escort.location || 'Not specified'}</p>
            <p>Rating: {escort.rating}/5 ({escort.total_reviews} reviews)</p>
            {escort.phone_number && (
              <p className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {escort.phone_number}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            View Profile
          </Button>
          
          {isPending ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => adminOverrideMutation.mutate({ escortId: escort.id })}
              disabled={adminOverrideMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Shield className="w-4 h-4 mr-1" />
              Override & Activate
            </Button>
          ) : (
            <Button
              variant={escort.verified ? "destructive" : "default"}
              size="sm"
              onClick={() => verifyEscortMutation.mutate({ escortId: escort.id, verified: escort.verified })}
              disabled={verifyEscortMutation.isPending}
            >
              {escort.verified ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Revoke
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verify
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Escort Management
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search escorts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="verified" className="space-y-4">
          <TabsList>
            <TabsTrigger value="verified" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Active Profiles ({verifiedEscorts.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Payment ({pendingEscorts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verified">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            ) : verifiedEscorts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active escort profiles found
              </div>
            ) : (
              <div className="space-y-4">
                {verifiedEscorts.map((escort) => renderEscortCard(escort, false))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            ) : pendingEscorts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending escort profiles found
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Shield className="w-5 h-5" />
                    <strong>Admin Override Available</strong>
                  </div>
                  <p className="text-blue-700 mt-1 text-sm">
                    These profiles are awaiting payment. You can activate them manually if there are payment processing delays.
                  </p>
                </div>
                {pendingEscorts.map((escort) => renderEscortCard(escort, true))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EscortManagement;
