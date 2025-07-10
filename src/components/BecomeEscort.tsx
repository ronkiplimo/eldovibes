
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BecomeEscortProps {
  escortProfile?: any;
}

const BecomeEscort = ({ escortProfile }: BecomeEscortProps) => {
  const { user } = useAuth();
  const { data: membership } = useMembership();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const createEscortProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Creating escort profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('escort_profiles')
        .insert({
          user_id: user.id,
          stage_name: 'New Escort', // Default stage name
          bio: null,
          age: null,
          hourly_rate: null,
          location: null,
          phone_number: null,
          category: null,
          services_offered: [],
          profile_image_url: null,
          availability_status: 'available',
          verified: false,
          rating: 0,
          total_reviews: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Escort profile creation error:', error);
        throw error;
      }

      console.log('Escort profile created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Profile creation successful, invalidating queries');
      // Invalidate all related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['escort-profile'] });
      queryClient.invalidateQueries({ queryKey: ['escort-profile-setup'] });
      
      toast({
        title: 'Escort Profile Created!',
        description: 'Your escort profile has been created successfully. Complete your setup to get started.',
      });
      
      // Navigate to setup page
      navigate('/escort-setup');
    },
    onError: (error: any) => {
      console.error('Profile creation failed:', error);
      
      let errorMessage = 'Failed to create escort profile. Please try again.';
      
      if (error?.message?.includes('row-level security')) {
        errorMessage = 'Authentication error. Please log out and log in again.';
      } else if (error?.message?.includes('duplicate')) {
        errorMessage = 'You already have an escort profile.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const handleCreateProfile = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create an escort profile.',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    if (escortProfile) {
      // Profile already exists, just navigate to setup
      navigate('/escort-setup');
      return;
    }

    setIsCreating(true);
    try {
      await createEscortProfileMutation.mutateAsync();
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusDisplay = () => {
    if (!escortProfile) {
      return {
        label: 'Not Created',
        color: 'bg-gray-100 text-gray-800',
        icon: AlertTriangle,
        description: 'Create your escort profile to get started'
      };
    }

    const isComplete = escortProfile.stage_name && escortProfile.bio && escortProfile.age && escortProfile.hourly_rate;
    const isPremium = membership?.status === 'paid';

    if (!isComplete) {
      return {
        label: 'Created – Setup Required',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
        description: 'Complete your profile setup to proceed'
      };
    }

    if (!isPremium) {
      return {
        label: 'Created – Not Yet Listed',
        color: 'bg-orange-100 text-orange-800',
        icon: CreditCard,
        description: 'Upgrade to Premium to list your profile'
      };
    }

    if (!escortProfile.verified) {
      return {
        label: 'Pending Approval',
        color: 'bg-blue-100 text-blue-800',
        icon: Heart,
        description: 'Your profile is under review'
      };
    }

    return {
      label: 'Listed',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      description: 'Your profile is live and accepting bookings'
    };
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-purple-600" />
          Become an Escort
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={`${status.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            Status: {status.label}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600">{status.description}</p>

        {!escortProfile ? (
          <Button 
            onClick={handleCreateProfile}
            disabled={isCreating || createEscortProfileMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isCreating || createEscortProfileMutation.isPending ? 'Creating...' : 'Create Escort Profile'}
          </Button>
        ) : (
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/escort-setup')}
              className="w-full"
              variant="outline"
            >
              {status.label === 'Created – Setup Required' ? 'Complete Setup' : 'Edit Profile'}
            </Button>
            
            {status.label === 'Created – Not Yet Listed' && (
              <Button 
                onClick={() => {
                  const paymentSection = document.getElementById('payment-section');
                  if (paymentSection) {
                    paymentSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BecomeEscort;
