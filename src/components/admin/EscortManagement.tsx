
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckCircle, X, Eye, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EscortManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: escorts, isLoading } = useQuery({
    queryKey: ['admin-escorts', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('escort_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('stage_name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-escorts'] });
      toast({
        title: 'Success',
        description: 'Escort verification status updated successfully'
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
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {escorts?.map((escort) => (
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
                        <Badge variant="destructive">
                          <X className="w-3 h-3 mr-1" />
                          Unverified
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
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EscortManagement;
