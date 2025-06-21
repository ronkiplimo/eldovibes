
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Calendar, DollarSign } from 'lucide-react';

const BookingManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings', searchTerm],
    queryFn: async () => {
      // First get bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Then get escort profiles for those bookings
      const escortIds = bookingsData?.map(booking => booking.escort_id).filter(Boolean) || [];
      
      if (escortIds.length === 0) {
        return bookingsData?.map(booking => ({
          ...booking,
          escort_name: 'Unknown Escort'
        })) || [];
      }

      const { data: escortsData, error: escortsError } = await supabase
        .from('escort_profiles')
        .select('id, stage_name')
        .in('id', escortIds);

      if (escortsError) throw escortsError;

      // Combine the data
      return bookingsData?.map(booking => ({
        ...booking,
        escort_name: escortsData?.find(escort => escort.id === booking.escort_id)?.stage_name || 'Unknown Escort'
      })) || [];
    }
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return (
      <Badge className={`${colors[status as keyof typeof colors]} text-white`}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Booking Management
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings?.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        Booking with {booking.escort_name}
                      </h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.booking_date).toLocaleString()}
                      </p>
                      <p className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${booking.total_amount} for {booking.duration_hours} hours
                      </p>
                      <p>Service: {booking.service_type}</p>
                      {booking.special_requests && (
                        <p>Special requests: {booking.special_requests}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingManagement;
