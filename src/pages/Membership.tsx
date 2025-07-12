
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Heart, User, ArrowRight, RefreshCw } from 'lucide-react';
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
    staleTime: 10000, // Consider data fresh for 10 seconds
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

          {/* Progress Status */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Check className="w-5 h-5" />
                Profile Created Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-800">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-green-600 text-white">
                      ✓
                    </div>
                    <span className="text-sm font-medium">Profile Created</span>
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-800">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white">
                      2
                    </div>
                    <span className="text-sm font-medium">Complete Payment</span>
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-600">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-400 text-white">
                      3
                    </div>
                    <span className="text-sm font-medium">Profile Live</span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <h5 className="font-medium text-blue-800">Your Profile Summary:</h5>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Name:</strong> {escortProfile?.stage_name}</li>
                  <li>• <strong>Location:</strong> {escortProfile?.location}</li>
                  <li>• <strong>Rate:</strong> KES {escortProfile?.hourly_rate}/hr</li>
                  <li>• <strong>Category:</strong> {escortProfile?.category}</li>
                  <li>• <strong>Services:</strong> {escortProfile?.services_offered?.length || 0} listed</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="max-w-md mx-auto">
            <MembershipUpgrade />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Become an Escort
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our premium platform and start earning with verified companion services
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

        {/* Flow Status */}
        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Heart className="w-5 h-5" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${hasProfile ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${hasProfile ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>
                    {hasProfile ? '✓' : '1'}
                  </div>
                  <span className="text-sm font-medium">Create Profile</span>
                </div>
                
                <ArrowRight className="w-4 h-4 text-gray-400" />
                
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isPaidMember ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isPaidMember ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>
                    {isPaidMember ? '✓' : '2'}
                  </div>
                  <span className="text-sm font-medium">Complete Payment</span>
                </div>
                
                <ArrowRight className="w-4 h-4 text-gray-400" />
                
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${(hasProfile && isPaidMember) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${(hasProfile && isPaidMember) ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>
                    {(hasProfile && isPaidMember) ? '✓' : '3'}
                  </div>
                  <span className="text-sm font-medium">Profile Live</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isPaidMember && hasProfile ? (
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
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : !hasProfile ? (
          <div className="space-y-8">
            {/* Step 1: Create Profile First */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <User className="w-5 h-5" />
                  Step 1: Create Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 mb-4">
                  Start by creating your complete escort profile with photos, services, contact details, and rates.
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

            {/* Membership Plans Preview */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <Card className="relative opacity-75">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-gray-600" />
                    Free Member
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">Free</div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Browse escort profiles
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Search and filter
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Send messages
                      </li>
                      <li className="flex items-center gap-2 text-gray-400">
                        <span className="w-4 h-4 text-center">×</span>
                        Create visible escort profiles
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="relative border-2 border-purple-200 bg-purple-50">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600">Required for Escorts</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    Premium Member
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-purple-600">KES 800<span className="text-lg font-normal">/month</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        All free features
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Visible escort profiles
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Priority in search results
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Profile verification badge
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Priority customer support
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Start earning immediately
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Membership;
