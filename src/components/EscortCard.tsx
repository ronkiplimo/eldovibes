
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, Verified, Phone } from 'lucide-react';
import { formatCurrency } from '@/hooks/useEscorts';

interface EscortCardProps {
  id: string;
  stageName: string;
  age: number | null;
  location: string | null;
  hourlyRate: number | null;
  rating: number;
  totalReviews: number;
  verified: boolean;
  availabilityStatus: 'available' | 'busy' | 'offline';
  category: string | null;
  profileImageUrl?: string | null;
  phoneNumber?: string | null;
  onViewProfile: (id: string) => void;
}

const EscortCard = ({
  id,
  stageName,
  age,
  location,
  hourlyRate,
  rating,
  totalReviews,
  verified,
  availabilityStatus,
  category,
  profileImageUrl,
  phoneNumber,
  onViewProfile
}: EscortCardProps) => {
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

  const handlePhoneCall = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <div className="h-40 sm:h-48 bg-gradient-to-br from-red-100 to-red-50">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={stageName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-4xl sm:text-6xl">👤</div>
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant={availabilityStatus === 'available' ? 'default' : 'secondary'} 
                 className={`${getStatusColor(availabilityStatus)} text-white text-xs`}>
            <Clock className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">{getStatusText(availabilityStatus)}</span>
            <span className="sm:hidden">{availabilityStatus === 'available' ? '●' : '○'}</span>
          </Badge>
        </div>
        {verified && (
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
              <h3 className="font-semibold text-base sm:text-lg truncate">{stageName}</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {age ? `${age} years old` : 'Age not specified'}
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="font-bold text-red-600 text-sm sm:text-base">
                {formatCurrency(hourlyRate || 0)}/hr
              </p>
              <div className="flex items-center text-xs sm:text-sm justify-end">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{rating.toFixed(1)} ({totalReviews})</span>
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{location || 'Location not specified'}</span>
          </div>
          
          {/* Category */}
          <Badge variant="outline" className="text-xs w-fit">
            {category || 'General'}
          </Badge>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={() => onViewProfile(id)}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 h-9 sm:h-10 text-xs sm:text-sm"
            >
              View Profile
            </Button>
            {phoneNumber && (
              <Button
                onClick={handlePhoneCall}
                variant="outline"
                size="icon"
                className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                title="Call Now"
              >
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EscortCard;
