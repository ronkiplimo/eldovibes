
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Clock, Verified, MessageCircle, Calendar, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BookingModal from '@/components/BookingModal';
import MessageModal from '@/components/MessageModal';
import ReviewsSection from '@/components/ReviewsSection';
import EscortBookings from '@/components/EscortBookings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/hooks/useEscorts';

const EscortProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const { data: escort, isLoading } = useQuery({
    queryKey: ['escort', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escort_profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="animate-pulse p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!escort) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-4 sm:p-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-600 mb-4">Profile not found</h1>
          <Button onClick={() => navigate('/')} className="w-full sm:w-auto">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowBookingModal(true);
  };

  const handleMessage = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowMessageModal(true);
  };

  const handlePhoneCall = () => {
    if (escort.phone_number) {
      window.location.href = `tel:${escort.phone_number}`;
    }
  };

  // Check if current user is the escort owner
  const isEscortOwner = user?.id === escort.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Profile Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                {/* Profile Image */}
                {escort.profile_image_url && (
                  <div className="mb-4 sm:mb-6">
                    <img
                      src={escort.profile_image_url}
                      alt={escort.stage_name}
                      className="w-full h-48 sm:h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Header Info - Stack on mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold">{escort.stage_name}</h1>
                        {escort.verified && (
                          <Badge className="bg-blue-500 text-white w-fit">
                            <Verified className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="text-sm sm:text-base">{escort.location || 'Location not specified'}</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="font-medium text-sm sm:text-base">{escort.rating?.toFixed(1) || '0.0'}</span>
                            <span className="text-gray-500 ml-1 text-sm">({escort.total_reviews || 0} reviews)</span>
                          </div>
                          <Badge variant={escort.availability_status === 'available' ? 'default' : 'secondary'} className="w-fit">
                            <Clock className="w-3 h-3 mr-1" />
                            {escort.availability_status === 'available' ? 'Available' : 
                             escort.availability_status === 'busy' ? 'Busy' : 'Offline'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price and Age - Right aligned on desktop, separate section on mobile */}
                    <div className="sm:text-right">
                      <p className="text-2xl sm:text-3xl font-bold text-red-600">
                        {formatCurrency(escort.hourly_rate || 0)}/hr
                      </p>
                      <p className="text-sm text-gray-500">{escort.age} years old</p>
                    </div>
                  </div>
                  
                  {escort.bio && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h3 className="font-semibold mb-2">About</h3>
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{escort.bio}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            {escort.services_offered && escort.services_offered.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Services Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {escort.services_offered.map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs sm:text-sm">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bookings - Only show to escort owner */}
            {isEscortOwner && (
              <EscortBookings escortUserId={escort.user_id} />
            )}

            {/* Reviews */}
            <ReviewsSection escortId={escort.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Contact & Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Contact & Book</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Button 
                  onClick={handleBookNow}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 h-11 sm:h-12 text-sm sm:text-base"
                  disabled={escort.availability_status !== 'available'}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {escort.availability_status === 'available' ? 'Book Appointment' : 'Currently Unavailable'}
                </Button>
                
                <Button 
                  onClick={handleMessage}
                  variant="outline"
                  className="w-full h-11 sm:h-12 text-sm sm:text-base"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>

                {escort.phone_number && (
                  <Button 
                    onClick={handlePhoneCall}
                    variant="outline"
                    className="w-full h-11 sm:h-12 text-sm sm:text-base"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                )}

                <div className="text-xs text-gray-500 text-center pt-2">
                  {!user && (
                    <p>
                      <button 
                        onClick={() => navigate('/auth')} 
                        className="text-red-600 hover:underline"
                      >
                        Login
                      </button> to send messages and book appointments
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-sm">
                  {escort.category || 'General'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBookingModal && (
        <BookingModal
          escort={escort}
          onClose={() => setShowBookingModal(false)}
        />
      )}
      
      {showMessageModal && (
        <MessageModal
          recipientId={escort.user_id}
          recipientName={escort.stage_name}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </div>
  );
};

export default EscortProfile;
