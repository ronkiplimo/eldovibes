
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Shield, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const BecomeEscort = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // Check if user already has an escort profile
  const { data: escortProfile, isLoading } = useQuery({
    queryKey: ['escort-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('escort_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  const handleBecomeEscort = async () => {
    if (!user?.id) return;
    
    setIsCreating(true);
    
    try {
      // Create a basic escort profile
      const { error } = await supabase
        .from('escort_profiles')
        .insert({
          user_id: user.id,
          stage_name: 'New Escort', // Default stage name
          bio: 'Welcome to my profile! I\'m excited to connect with you.',
          age: 25, // Default age
          hourly_rate: 5000, // Default rate
          location: 'Eldoret',
          availability_status: 'available',
          verified: false, // Will be verified by admin
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your escort profile has been created. Please complete your profile setup.',
      });

      // Navigate to profile setup or dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating escort profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to create escort profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user already has an escort profile
  if (escortProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-600" />
            Escort Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Heart className="w-3 h-3 mr-1" />
                Escort Profile Active
              </Badge>
              {escortProfile.verified && (
                <Badge variant="default">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Stage Name:</strong> {escortProfile.stage_name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> {escortProfile.availability_status}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Hourly Rate:</strong> KES {escortProfile.hourly_rate?.toLocaleString()}
              </p>
            </div>
            
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Manage Escort Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user doesn't have an escort profile yet
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-purple-600" />
          Become an Escort
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            Join our exclusive network of verified companions and start earning with EldoVibes.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">Build your reputation with client reviews</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">Verified profile badge for trust</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Connect with quality clients</span>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              onClick={handleBecomeEscort}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? 'Creating Profile...' : 'Become an Escort'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BecomeEscort;
