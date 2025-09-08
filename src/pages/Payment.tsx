
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, CheckCircle, Phone, AlertCircle, ArrowLeft, Edit, User, MapPin, DollarSign } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useMembership, useInitiateMpesaPayment } from '@/hooks/useMembership';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: membership, refetch: refetchMembership } = useMembership();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  
  const initiateMpesaPayment = useInitiateMpesaPayment();

  // Check if user has escort profile with better error handling
  const { data: escortProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['escort-profile-payment', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available for payment page');
        return null;
      }
      
      console.log('Payment page fetching escort profile for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('escort_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Payment page escort profile fetch error:', error);
          // Don't throw error, just return null to handle gracefully
          return null;
        }
        
        console.log('Payment page escort profile data:', data);
        return data;
      } catch (err) {
        console.error('Unexpected error fetching escort profile on payment page:', err);
        return null;
      }
    },
    enabled: !!user?.id,
    retry: 1, // Only retry once to avoid spam
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // If user doesn't have a profile, redirect to create one
    if (!profileLoading && !escortProfile) {
      console.log('No profile found, redirecting to escort setup');
      navigate('/escort-setup');
      return;
    }

    // If user is already paid, redirect to dashboard
    if (membership?.status === 'paid') {
      console.log('User already paid, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }
  }, [user, escortProfile, profileLoading, membership, navigate]);

  const handlePayment = async () => {
    if (!user || !phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number format
    const phoneRegex = /^(254|0)[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (e.g., 254712345678 or 0712345678)",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsPaymentPending(true);
      setPaymentError('');
      
      const result = await initiateMpesaPayment.mutateAsync({
        phoneNumber,
        userId: user.id
      });

      if (result.success) {
        toast({
          title: "Payment Request Sent",
          description: "Please check your phone for the M-Pesa prompt and enter your PIN to complete the payment.",
        });
        
        // Poll for payment completion
        setTimeout(() => {
          setIsPaymentPending(false);
          window.location.reload();
        }, 45000);
      } else {
        throw new Error(result.error || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      
      let errorMessage = 'Failed to initiate payment. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      setPaymentError(errorMessage);
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setIsPaymentPending(false);
    }
  };

  if (!user) {
    return null;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!escortProfile) {
    return null; // Will redirect to membership/escort-setup
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/membership')}
            variant="outline"
            size="sm"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Membership
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Activate Your Profile
          </h1>
          <p className="text-gray-600">
            Complete your payment to make your profile visible to clients and start earning.
          </p>
        </div>

        {/* Profile Summary Card */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Profile Created Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-green-700 mb-4">
                Your escort profile is ready and saved permanently. Complete payment to make it visible to clients.
              </p>
              
              {/* Profile Summary */}
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-green-800">Profile Summary</h5>
                  <Button 
                    onClick={() => navigate('/escort-setup?edit=true')}
                    variant="outline"
                    size="sm"
                    className="text-green-700 border-green-300 hover:bg-green-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">
                      <strong>Name:</strong> {escortProfile.stage_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-green-700">
                      <strong>Age:</strong> {escortProfile.age} years
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">
                      <strong>Location:</strong> {escortProfile.location}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">
                      <strong>Rate:</strong> KES {escortProfile.hourly_rate}/hr
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-green-700">
                      <strong>Category:</strong> {escortProfile.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-green-700">
                      <strong>Services:</strong> {escortProfile.services_offered?.length || 0} listed
                    </span>
                  </div>
                </div>
                
                {escortProfile.bio && (
                  <div className="mt-3 pt-3 border-t border-green-100">
                    <span className="text-green-700 text-sm">
                      <strong>Bio:</strong> {escortProfile.bio.substring(0, 150)}
                      {escortProfile.bio.length > 150 ? '...' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Complete Payment - KES 800
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Payment Failed</p>
                    <p className="text-xs text-red-600 mt-1">{paymentError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-gray-500" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="254712345678 or 0712345678"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (paymentError) setPaymentError('');
                  }}
                  disabled={isPaymentPending}
                />
              </div>
            </div>
            
            <Button 
              onClick={handlePayment}
              disabled={!phoneNumber || isPaymentPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isPaymentPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing M-Pesa Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay KES 800 to Activate Profile
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 space-y-1 pt-4 border-t">
              <p>• Secure payment via M-Pesa STK Push</p>
              <p>• 30-day Premium membership</p>
              <p>• Profile becomes visible immediately after payment</p>
              <p>• You can edit your profile anytime</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
