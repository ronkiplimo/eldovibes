
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
        <div className="animate-pulse p-8">Loading...</div>
      </div>
    );
  }

  if (!escort) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-600">Profile not found</h1>
          <Button onClick={() => navigate('/')} className="mt-4">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                {/* Profile Image */}
                {escort.profile_image_url && (
                  <div className="mb-6">
                    <img
                      src={escort.profile_image_url}
                      alt={escort.stage_name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{escort.stage_name}</h1>
                      {escort.verified && (
                        <Badge className="bg-blue-500 text-white">
                          <Verified className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {escort.location || 'Location not specified'}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium">{escort.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-gray-500 ml-1">({escort.total_reviews || 0} reviews)</span>
                      </div>
                      <Badge variant={escort.availability_status === 'available' ? 'default' : 'secondary'}>
                        <Clock className="w-3 h-3 mr-1" />
                        {escort.availability_status === 'available' ? 'Available' : 
                         escort.availability_status === 'busy' ? 'Busy' : 'Offline'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">
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
                      <p className="text-gray-700 leading-relaxed">{escort.bio}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            {escort.services_offered && escort.services_offered.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {escort.services_offered.map((service, index) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <ReviewsSection escortId={escort.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact & Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Book</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleBookNow}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={escort.availability_status !== 'available'}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {escort.availability_status === 'available' ? 'Book Appointment' : 'Currently Unavailable'}
                </Button>
                
                <Button 
                  onClick={handleMessage}
                  variant="outline"
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>

                {escort.phone_number && (
                  <Button 
                    onClick={handlePhoneCall}
                    variant="outline"
                    className="w-full"
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
                        className="text-purple-600 hover:underline"
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
                <CardTitle>Category</CardTitle>
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
