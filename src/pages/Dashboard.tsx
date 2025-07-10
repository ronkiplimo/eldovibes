
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BecomeEscort from '@/components/BecomeEscort';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { data: membership } = useMembership();
  const navigate = useNavigate();

  // Fetch user profile to get the full name
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Check if user has escort profile - with real-time updates
  const { data: escortProfile } = useQuery({
    queryKey: ['escort-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Dashboard fetching escort profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('escort_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Dashboard escort profile fetch error:', error);
        throw error;
      }
      
      console.log('Dashboard escort profile data:', data);
      return data;
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleViewMessages = () => {
    navigate('/messages');
  };

  const handleManageProfile = () => {
    if (escortProfile) {
      navigate('/escort-setup');
    } else {
      navigate('/membership');
    }
  };

  const getEscortProfileStatus = () => {
    if (!escortProfile) return { 
      label: 'Not Created', 
      emoji: '❌', 
      color: 'bg-gray-100 text-gray-800' 
    };
    
    const isComplete = escortProfile.stage_name && escortProfile.bio && escortProfile.age && escortProfile.hourly_rate;
    const isPremium = membership?.status === 'paid';
    
    if (!isComplete) return { 
      label: 'Created – Setup Required', 
      emoji: '✅', 
      color: 'bg-yellow-100 text-yellow-800' 
    };
    
    if (!isPremium && !escortProfile.verified) return { 
      label: 'Created – Payment Required', 
      emoji: '💳', 
      color: 'bg-orange-100 text-orange-800' 
    };
    
    if (!escortProfile.verified && isPremium) return { 
      label: 'Pending Approval', 
      emoji: '🕓', 
      color: 'bg-blue-100 text-blue-800' 
    };
    
    return { 
      label: 'Active & Listed', 
      emoji: '🌐', 
      color: 'bg-green-100 text-green-800' 
    };
  };

  const displayName = profile?.full_name || user?.email || 'User';
  const escortStatus = getEscortProfileStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome, {displayName}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={handleViewMessages}
                  >
                    <MessageSquare className="w-6 h-6" />
                    View Messages
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={handleManageProfile}
                  >
                    <Users className="w-6 h-6" />
                    {escortProfile ? 'Manage Profile' : 'Create Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Escort Profile Analytics */}
            {escortProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Escort Profile Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {escortProfile.rating?.toFixed(1) || '0.0'}
                      </div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {escortProfile.total_reviews || 0}
                      </div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">0</div>
                      <div className="text-sm text-gray-600">This Month</div>
                    </div>

                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {escortProfile.hourly_rate ? `KES ${escortProfile.hourly_rate}` : 'Not Set'}
                      </div>
                      <div className="text-sm text-gray-600">Hourly Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {escortProfile ? '1' : '0'}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Escort Profile</div>
                    <Badge variant="outline" className={`text-xs ${escortStatus.color}`}>
                      {escortStatus.emoji} {escortStatus.label}
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Messages</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-600">Bookings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Become an Escort - only show if no escort profile exists */}
            {!escortProfile && <BecomeEscort />}
            
            {/* Profile Status - only show if escort profile exists */}
            {escortProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profile Status</span>
                      <Badge variant="outline" className={escortStatus.color}>
                        {escortStatus.emoji} {escortStatus.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Membership</span>
                      <Badge variant={membership?.status === 'paid' ? 'default' : 'secondary'}>
                        {membership?.status === 'paid' ? 'Premium' : 'Free'}
                      </Badge>
                    </div>

                    {membership?.status === 'paid' && membership.expires_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expires</span>
                        <span className="text-sm font-medium">
                          {new Date(membership.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {!escortProfile.verified && membership?.status !== 'paid' && (
                      <div className="pt-3 border-t">
                        <Button 
                          onClick={() => navigate('/membership')}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          Complete Payment
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email</span>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <div className="pt-3 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
