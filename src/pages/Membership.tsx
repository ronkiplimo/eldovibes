
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import MembershipUpgrade from '@/components/MembershipUpgrade';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';

const Membership = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: membership } = useMembership();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const isPaidMember = membership?.status === 'paid';

  const handleProceedToProfileCreation = () => {
    navigate('/escort-setup');
  };

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
        </div>

        {isPaidMember ? (
          <div className="text-center space-y-6">
            <Card className="max-w-md mx-auto border-green-200 bg-green-50">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-green-800">Premium Membership Active</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  You're all set! Your premium membership is active and you can now create your escort profile.
                </p>
                <Button 
                  onClick={handleProceedToProfileCreation}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Create Your Escort Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Membership Plans */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Free Plan */}
              <Card className="relative">
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
                        Create escort profiles
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="relative border-2 border-purple-200 bg-purple-50">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600">Most Popular</Badge>
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
                        Create escort profiles
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Priority in search results
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Profile verification
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

            {/* Payment Section */}
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-center mb-6">
                Ready to Start Earning?
              </h3>
              <MembershipUpgrade />
            </div>

            {/* Benefits Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Why Upgrade to Premium?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">💰 Start Earning</h4>
                    <p className="text-sm text-gray-600">Create your profile and start accepting bookings immediately after verification.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🔒 Verified Profile</h4>
                    <p className="text-sm text-gray-600">Get the blue verified badge that builds trust with potential clients.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">📱 Direct Contact</h4>
                    <p className="text-sm text-gray-600">Clients can call and message you directly through your profile.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">⭐ Priority Listing</h4>
                    <p className="text-sm text-gray-600">Your profile appears higher in search results for better visibility.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Membership;
