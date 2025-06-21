
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, Verified, Phone } from 'lucide-react';

interface EscortCardProps {
  id: string;
  stageName: string;
  age: number;
  location: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  verified: boolean;
  availabilityStatus: 'available' | 'busy' | 'offline';
  category: string;
  profileImageUrl?: string;
  phoneNumber?: string;
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
        <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={stageName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl">👤</div>
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant={availabilityStatus === 'available' ? 'default' : 'secondary'} 
                 className={`${getStatusColor(availabilityStatus)} text-white`}>
            <Clock className="w-3 h-3 mr-1" />
            {getStatusText(availabilityStatus)}
          </Badge>
        </div>
        {verified && (
          <div className="absolute top-2 left-2">
            <Badge variant="default" className="bg-blue-500 text-white">
              <Verified className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{stageName}</h3>
            <p className="text-sm text-gray-600">{age} years old</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-purple-600">${hourlyRate}/hr</p>
            <div className="flex items-center text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span>{rating.toFixed(1)} ({totalReviews})</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          {location}
        </div>
        
        <Badge variant="outline" className="mb-3">
          {category}
        </Badge>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => onViewProfile(id)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            View Profile
          </Button>
          {phoneNumber && (
            <Button
              onClick={handlePhoneCall}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Phone className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EscortCard;
