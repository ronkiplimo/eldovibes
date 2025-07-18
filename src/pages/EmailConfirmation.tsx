import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (token && type === 'signup') {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (error) {
            console.error('Email confirmation error:', error);
            toast({
              title: 'Confirmation Failed',
              description: 'There was an error confirming your email. Please try again.',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Email Confirmed!',
              description: 'Your email has been successfully verified. You can now sign in.',
            });
          }
        } catch (error) {
          console.error('Confirmation error:', error);
          toast({
            title: 'Confirmation Failed',
            description: 'There was an error confirming your email. Please try again.',
            variant: 'destructive'
          });
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, toast]);

  const handleSignIn = () => {
    navigate('/auth');
  };

  const token = searchParams.get('token');
  const type = searchParams.get('type');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {token && type === 'signup' ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <AlertCircle className="w-16 h-16 text-orange-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {token && type === 'signup' ? 'Email Confirmed!' : 'Confirm Your Email'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {token && type === 'signup' ? (
            <>
              <p className="text-gray-600">
                Your email has been successfully verified. You can now sign in to your EldoVibes account.
              </p>
              <Button 
                onClick={handleSignIn}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Continue to Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-600">
                Please check your email and click the confirmation link to verify your account.
              </p>
              <Button 
                onClick={handleSignIn}
                variant="outline"
                className="w-full"
              >
                Go to Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;