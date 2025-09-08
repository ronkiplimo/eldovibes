
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, CreditCard, CheckCircle, AlertTriangle, Edit } from 'lucide-react';
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
          stage_name: 'New Escort',
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
      queryClient.invalidateQueries({ queryKey: ['escort-profile'] });
      queryClient.invalidateQueries({ queryKey: ['escort-profile-setup'] });
      
      toast({
        title: 'Escort Profile Created!',
        description: 'Your escort profile has been created successfully. Complete your setup to get started.',
      });
      
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

  const handleProfileAction = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to manage your escort profile.',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    // Check membership status first
    if (membership?.status !== 'paid') {
      navigate('/membership');
      return;
    }

    // If profile exists, go to edit mode
    if (escortProfile) {
      navigate('/escort-setup?edit=true');
      return;
    }

    // Create new profile only if none exists
    setIsCreating(true);
    try {
      await createEscortProfileMutation.mutateAsync();
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusDisplay = () => {
    if (!membership || membership.status !== 'paid') {
      return {
        label: 'Premium Membership Required',
        color: 'bg-orange-100 text-orange-800',
        icon: CreditCard,
        description: 'Upgrade to Premium to create your escort profile'
      };
    }

    if (!escortProfile) {
      return {
        label: 'Profile Not Created',
        color: 'bg-gray-100 text-gray-800',
        icon: AlertTriangle,
        description: 'Create your escort profile to get started'
      };
    }

    const isComplete = escortProfile.stage_name && escortProfile.bio && escortProfile.age && escortProfile.hourly_rate;

    if (!isComplete) {
      return {
        label: 'Setup Required',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
        description: 'Complete your profile setup to go live'
      };
    }

    if (!escortProfile.verified) {
      return {
        label: 'Pending Verification',
        color: 'bg-blue-100 text-blue-800',
        icon: Heart,
        description: 'Your profile is under review'
      };
    }

    return {
      label: 'Live & Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      description: 'Your profile is live and accepting bookings'
    };
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;
  const isPaidMember = membership?.status === 'paid';
  const hasProfile = !!escortProfile;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          {hasProfile ? 'Escort Profile' : 'Become an Escort'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={`${status.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600">{status.description}</p>

        {!isPaidMember ? (
          <Button 
            onClick={() => navigate('/membership')}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Upgrade to Premium - KES 800/month
          </Button>
        ) : (
          <Button 
            onClick={handleProfileAction}
            disabled={isCreating || createEscortProfileMutation.isPending}
            className={`w-full ${hasProfile ? '' : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'}`}
            variant={hasProfile ? "outline" : "default"}
          >
            {isCreating || createEscortProfileMutation.isPending ? (
              'Creating...'
            ) : hasProfile ? (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            ) : (
              'Create Escort Profile'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BecomeEscort;
