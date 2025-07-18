
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, Verified, Phone, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/hooks/useEscorts';

interface EscortListingsProps {
  escorts: any[];
  isLoading: boolean;
}

const EscortListings = ({ escorts, isLoading }: EscortListingsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleViewProfile = (id: string) => {
    navigate(`/escort/${id}`);
  };

  const handlePhoneCall = async (escortId: string) => {
    try {
      const escort = escorts.find(e => e.id === escortId);
      if (escort?.phone_number) {
        window.location.href = `tel:${escort.phone_number}`;
      } else {
        console.log('Phone number not available');
      }
    } catch (error) {
      console.error('Error accessing phone number:', error);
    }
  };

  const handleMessage = (escortUserId: string, escortName: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/messages?recipient=${escortUserId}&name=${encodeURIComponent(escortName)}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-40 sm:h-48 bg-gray-200"></div>
            <CardContent className="p-3 sm:p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!escorts || escorts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
          No companions available
        </div>
        <p className="text-sm sm:text-base text-gray-500">
          Check back soon for amazing companions in your area
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {escorts.map((escort) => (
        <Card key={escort.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <div className="h-40 sm:h-48 bg-gradient-to-br from-purple-100 to-pink-100">
              {escort.profile_image_url ? (
                <img
                  src={escort.profile_image_url}
                  alt={escort.stage_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-4xl sm:text-6xl">👤</div>
                </div>
              )}
            </div>
            <div className="absolute top-2 right-2">
              <Badge variant={escort.availability_status === 'available' ? 'default' : 'secondary'} 
                     className={`${getStatusColor(escort.availability_status)} text-white text-xs`}>
                <Clock className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{getStatusText(escort.availability_status)}</span>
                <span className="sm:hidden">{escort.availability_status === 'available' ? '●' : '○'}</span>
              </Badge>
            </div>
            {escort.verified && (
              <div className="absolute top-2 left-2">
                <Badge variant="default" className="bg-blue-500 text-white text-xs">
                  <Verified className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Verified</span>
                  <span className="sm:hidden">✓</span>
                </Badge>
              </div>
            )}
          </div>
          
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate">{escort.stage_name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {escort.age ? `${escort.age} years old` : 'Age not specified'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-bold text-purple-600 text-sm sm:text-base">
                    {formatCurrency(escort.hourly_rate || 0)}/hr
                  </p>
                  <div className="flex items-center text-xs sm:text-sm justify-end">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{escort.rating?.toFixed(1) || '0.0'} ({escort.total_reviews || 0})</span>
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{escort.location || 'Location not specified'}</span>
              </div>
              
              {/* Category */}
              <Badge variant="outline" className="text-xs w-fit">
                {escort.category || 'General'}
              </Badge>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleViewProfile(escort.id)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-9 sm:h-10 text-xs sm:text-sm"
                >
                  View Profile
                </Button>
                {escort.phone_number && (
                  <Button
                    onClick={() => handlePhoneCall(escort.id)}
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                    title="Call Now"
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                )}
                <Button
                  onClick={() => handleMessage(escort.user_id, escort.stage_name)}
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                  title="Send Message"
                >
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EscortListings;
