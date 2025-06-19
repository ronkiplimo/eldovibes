
import { ReactNode } from 'react';
import { useMembership } from '@/hooks/useMembership';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, CreditCard } from 'lucide-react';
import MembershipUpgrade from './MembershipUpgrade';

interface MembershipGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const MembershipGuard = ({ children, fallback }: MembershipGuardProps) => {
  const { data: membership, isLoading } = useMembership();

  if (isLoading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  const isPaidMember = membership?.status === 'paid';
  const isExpired = membership?.status === 'expired';

  if (!isPaidMember) {
    return fallback || (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-gray-600" />
            </div>
            <CardTitle>Premium Membership Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-gray-600 mb-6">
              {isExpired ? (
                <p>Your membership has expired. Please renew to continue posting escort profiles.</p>
              ) : (
                <p>You need a premium membership to create escort profiles and access all features.</p>
              )}
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Free vs Premium</h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <Badge variant="outline" className="mb-2">Free Member</Badge>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Browse escort profiles</li>
                    <li>✓ Search and filter</li>
                    <li>✓ Send messages</li>
                    <li>✗ Create escort profiles</li>
                  </ul>
                </div>
                
                <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                  <Badge className="mb-2 bg-purple-600">Premium Member</Badge>
                  <ul className="text-sm space-y-1">
                    <li>✓ All free features</li>
                    <li>✓ Create escort profiles</li>
                    <li>✓ Priority support</li>
                    <li>✓ Advanced features</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <MembershipUpgrade />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default MembershipGuard;
