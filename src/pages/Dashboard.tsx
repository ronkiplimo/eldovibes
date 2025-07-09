
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, CreditCard, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MembershipUpgrade from '@/components/MembershipUpgrade';
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
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchInterval: 30000, // Refetch every 30 seconds to catch updates
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const handleViewMessages = () => {
    navigate('/messages');
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
    
    if (!isPremium) return { 
      label: 'Created – Not Yet Listed', 
      emoji: '✅', 
      color: 'bg-orange-100 text-orange-800' 
    };
    
    if (!escortProfile.verified) return { 
      label: 'Pending Approval', 
      emoji: '🕓', 
      color: 'bg-blue-100 text-blue-800' 
    };
    
    return { 
      label: 'Listed', 
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
                  <Settings className="w-5 h-5" />
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
                    onClick={() => navigate('/profile')}
                  >
                    <Users className="w-6 h-6" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

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
            {/* Become an Escort */}
            <BecomeEscort />
            
            {/* Membership Status */}
            <div id="payment-section">
              <MembershipUpgrade />
            </div>

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
