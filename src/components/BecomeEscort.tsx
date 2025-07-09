
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Shield, Users, Settings, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const BecomeEscort = () => {
  const { user } = useAuth();
  const { data: membership } = useMembership();
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
      // If escort profile already exists, just redirect to setup
      if (escortProfile) {
        toast({
          title: 'Profile Found!',
          description: 'Redirecting to your escort profile setup...',
        });
        navigate('/escort-setup');
        return;
      }

      // Create a new escort profile
      const { error } = await supabase
        .from('escort_profiles')
        .insert({
          user_id: user.id,
          stage_name: '', // Empty to be filled in setup
          bio: '',
          age: null,
          hourly_rate: null,
          location: '',
          availability_status: 'available',
          verified: false,
          is_active: false // Not active until profile is complete and payment is made
        });

      if (error) throw error;

      toast({
        title: 'Escort Profile Created!',
        description: 'Please complete your profile setup to start receiving bookings.',
      });

      // Redirect to escort setup page
      navigate('/escort-setup');
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

  const getProfileStatus = () => {
    if (!escortProfile) return { status: 'not_created', label: 'Not Created', color: 'gray', description: 'Create your escort profile to start earning' };
    
    const isComplete = escortProfile.stage_name && escortProfile.bio && escortProfile.age && escortProfile.hourly_rate;
    const isPremium = membership?.status === 'paid';
    
    if (!isComplete) return { 
      status: 'incomplete', 
      label: 'Draft', 
      color: 'yellow', 
      description: 'Complete your profile information'
    };
    
    if (!isPremium) return { 
      status: 'needs_premium', 
      label: 'Pending Payment', 
      color: 'orange', 
      description: 'Upgrade to Premium to publish your profile'
    };
    
    if (!escortProfile.verified) return { 
      status: 'pending_approval', 
      label: 'Pending Approval', 
      color: 'blue', 
      description: 'Your profile is under review'
    };
    
    return { 
      status: 'live', 
      label: 'Live', 
      color: 'green', 
      description: 'Your profile is active and visible to clients'
    };
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

  const profileStatus = getProfileStatus();

  // If user already has an escort profile
  if (escortProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-600" />
            Your Escort Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Badge 
                variant={profileStatus.color === 'green' ? 'default' : 'secondary'}
                className={`
                  w-fit
                  ${profileStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${profileStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                  ${profileStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                  ${profileStatus.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
                  ${profileStatus.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                `}
              >
                {profileStatus.status === 'incomplete' && '🚫'}
                {profileStatus.status === 'needs_premium' && '🟨'}
                {profileStatus.status === 'pending_approval' && '🕓'}
                {profileStatus.status === 'live' && '✅'}
                {' '}Status: {profileStatus.label}
              </Badge>
              
              <p className="text-sm text-gray-600">{profileStatus.description}</p>
              
              {escortProfile.verified && (
                <Badge variant="default" className="w-fit">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            {escortProfile.stage_name && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Stage Name:</strong> {escortProfile.stage_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> {escortProfile.availability_status}
                </p>
                {escortProfile.hourly_rate && (
                  <p className="text-sm text-gray-600">
                    <strong>Hourly Rate:</strong> KES {escortProfile.hourly_rate?.toLocaleString()}
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/escort-setup')}
                className="w-full"
                variant={profileStatus.status === 'incomplete' ? 'default' : 'outline'}
              >
                <Settings className="w-4 h-4 mr-2" />
                {profileStatus.status === 'incomplete' ? 'Complete Profile Setup' : 'Edit Profile'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              {profileStatus.status === 'needs_premium' && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Premium Required</p>
                      <p className="text-xs text-orange-600 mt-1">
                        Upgrade to Premium for KES 800/month to publish your profile and start earning.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isCreating ? 'Creating Profile...' : 'Create Escort Profile'}
              {!isCreating && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              You'll complete your profile setup on the next page
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BecomeEscort;
