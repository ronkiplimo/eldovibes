
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/hooks/useEscorts';

interface EscortBookingsProps {
  escortUserId: string;
}

const EscortBookings = ({ escortUserId }: EscortBookingsProps) => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['escort-bookings', escortUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles!client_id(full_name)
        `)
        .eq('escort_id', escortUserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No bookings yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recent Bookings ({bookings.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {booking.profiles?.full_name || 'Unknown Client'}
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {new Date(booking.booking_date).toLocaleDateString()}
                    <Clock className="w-3 h-3 ml-2" />
                    {booking.duration_hours}h
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <DollarSign className="w-3 h-3" />
                    {formatCurrency(booking.total_amount)}
                  </div>
                  <div className="text-xs text-gray-500">{booking.service_type}</div>
                </div>
              </div>
              {booking.special_requests && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Special requests:</strong> {booking.special_requests}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EscortBookings;
