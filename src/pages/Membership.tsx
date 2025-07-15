
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Heart, User, ArrowRight, RefreshCw, Edit } from 'lucide-react';
import Navbar from '@/components/Navbar';
import MembershipUpgrade from '@/components/MembershipUpgrade';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Membership = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: membership, refetch: refetchMembership } = useMembership();

  // Check if user has escort profile with better error handling
  const { data: escortProfile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['escort-profile-membership', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Membership page fetching escort profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('escort_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Membership page escort profile fetch error:', error);
        return null;
      }
      
      console.log('Membership page escort profile data:', data);
      return data;
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });

  // Refresh data when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      refetchProfile();
      refetchMembership();
    }
  }, [user?.id, refetchProfile, refetchMembership]);

  const handleRefresh = async () => {
    await Promise.all([refetchProfile(), refetchMembership()]);
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const isPaidMember = membership?.status === 'paid';
  const hasProfile = !!escortProfile;

  const handleCreateProfile = () => {
    navigate('/escort-setup');
  };

  const handleEditProfile = () => {
    navigate('/escort-setup?edit=true');
  };

  // Loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // If profile exists and user is paid, show success
  if (hasProfile && isPaidMember) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <Card className="max-w-md mx-auto border-green-200 bg-green-50">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-green-800">🎉 Profile Active!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  Congratulations! Your escort profile is now live and visible to clients. You can start receiving bookings.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Go to Dashboard
                  </Button>
                  <Button 
                    onClick={handleEditProfile}
                    variant="outline"
                    className="w-full"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If profile exists but not paid, show payment section directly
  if (hasProfile && !isPaidMember) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Your Payment
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your profile is ready! Pay KES 800 to make it visible to clients and start earning.
            </p>
            
            <div className="flex gap-2 justify-center mt-4">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
              <Button 
                onClick={handleEditProfile}
                variant="outline"
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <MembershipUpgrade />
          </div>
        </div>
      </div>
    );
  }

  // If no profile exists, show profile creation only
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Escort Profile
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start by creating your complete escort profile. Your profile will be saved and you can publish it later.
          </p>
          
          <Button 
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <User className="w-5 h-5" />
                Create Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                Create your complete escort profile with photos, services, contact details, and rates. Your profile will be saved permanently.
              </p>
              <Button 
                onClick={handleCreateProfile}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <User className="w-4 h-4 mr-2" />
                Create Your Escort Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Membership;
