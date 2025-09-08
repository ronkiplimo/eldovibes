
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, CheckCircle, Clock, Phone, AlertCircle, Heart, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMembership, useInitiateMpesaPayment } from '@/hooks/useMembership';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const MembershipUpgrade = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const { user } = useAuth();
  const { data: membership, isLoading } = useMembership();
  const { toast } = useToast();
  
  const initiateMpesaPayment = useInitiateMpesaPayment();

  // Check if user has escort profile
  const { data: escortProfile } = useQuery({
    queryKey: ['escort-profile-upgrade', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('escort_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('MembershipUpgrade escort profile fetch error:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id
  });

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
      
      console.log('Initiating M-Pesa payment for user:', user.id);
      
      const result = await initiateMpesaPayment.mutateAsync({
        phoneNumber,
        userId: user.id
      });

      console.log('Payment result:', result);

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
      let errorDetails = '';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for specific error codes
      if (error.message?.includes('MISSING_CREDENTIALS')) {
        errorDetails = 'M-Pesa credentials are not properly configured.';
      } else if (error.message?.includes('TOKEN_FAILED')) {
        errorDetails = 'Failed to authenticate with M-Pesa. Please try again.';
      } else if (error.message?.includes('STK_FAILED')) {
        errorDetails = 'M-Pesa request failed. Please check your phone number and try again.';
      } else if (error.message?.includes('Invalid phone number')) {
        errorDetails = 'Please enter a valid Kenyan phone number.';
      }
      
      setPaymentError(`${errorMessage}${errorDetails ? ` ${errorDetails}` : ''}`);
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setIsPaymentPending(false);
    }
  };

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (isLoading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Membership Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {membership?.status === 'paid' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">Premium Member</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            
            {membership.expires_at && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Expires: {formatExpiryDate(membership.expires_at)}
                </p>
                
                {isExpiringSoon(membership.expires_at) && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Your membership expires soon. Renew to continue using premium features.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Premium Benefits:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your escort profile is live and visible to clients</li>
                <li>• Priority in search results</li>
                <li>• Direct messaging with clients</li>
                <li>• Booking management system</li>
                <li>• Priority customer support</li>
              </ul>
            </div>

            {escortProfile && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-sm">Escort Profile Status</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {escortProfile.verified ? 'Live & Visible to Clients' : 'Activating...'}
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Free Member</Badge>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-600" />
                <h4 className="font-medium">Activate Your Escort Profile</h4>
              </div>
              
              {escortProfile ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-green-800">
                        Profile Created Successfully!
                      </p>
                    </div>
                    <p className="text-sm text-green-700">
                      Your escort profile is ready. Complete payment to make it visible to clients and start earning.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <h5 className="font-medium text-blue-800">Profile Summary:</h5>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• <strong>Name:</strong> {escortProfile.stage_name}</li>
                      <li>• <strong>Location:</strong> {escortProfile.location}</li>
                      <li>• <strong>Rate:</strong> KES {escortProfile.hourly_rate}/hr</li>
                      <li>• <strong>Category:</strong> {escortProfile.category}</li>
                      <li>• <strong>Services:</strong> {escortProfile.services_offered?.length || 0} listed</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        <strong>Status:</strong> Profile created but hidden from clients. Pay KES 800 to activate.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-800">
                      <strong>No Profile Found:</strong> Please create your escort profile first before upgrading to Premium.
                    </p>
                  </div>
                </div>
              )}
              
              {paymentError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Payment Failed</p>
                      <p className="text-xs text-red-600 mt-1">{paymentError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {escortProfile && (
                <div className="space-y-3 pt-3 border-t">
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
                </div>
              )}
              
              {!escortProfile && (
                <div className="pt-3 border-t text-center">
                  <Button 
                    onClick={() => window.location.href = '/escort-setup'}
                    variant="outline"
                    className="w-full"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Create Your Escort Profile First
                  </Button>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Secure payment via M-Pesa STK Push</p>
              <p>• 30-day Premium membership</p>
              <p>• Profile becomes visible immediately after payment</p>
              <p>• Auto-renewal available (contact support)</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MembershipUpgrade;
