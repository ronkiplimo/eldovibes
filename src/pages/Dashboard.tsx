
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MessageCircle, Star, DollarSign, Clock, CheckCircle, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery({
    queryKey: ['userBookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          escort_profiles!bookings_escort_id_fkey(stage_name, hourly_rate),
          client_profile:profiles!bookings_client_id_fkey(full_name)
        `)
        .or(`client_id.eq.${user.id},escort_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['recentMessages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name),
          receiver:profiles!messages_receiver_id_fkey(full_name)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(`Booking ${status} successfully`);
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const clientBookings = bookings.filter(booking => booking.client_id === user?.id);
  const escortBookings = bookings.filter(booking => booking.escort_id === user?.id);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Please sign in to access your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="messages">Recent Messages</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold">{bookings.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {bookings.filter(b => b.status === 'pending').length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Confirmed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {bookings.filter(b => b.status === 'confirmed').length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Messages</p>
                      <p className="text-2xl font-bold">{messages.length}</p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bookings as Client */}
            {clientBookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings (as Client)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">
                              {booking.escort_profiles?.stage_name}
                            </h3>
                            <p className="text-sm text-gray-600">{booking.service_type}</p>
                          </div>
                          <Badge className={getStatusColor(booking.status) + ' text-white'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p>{new Date(booking.booking_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <p>{booking.duration_hours} hours</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <p className="font-semibold">${booking.total_amount}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <p>{new Date(booking.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {booking.special_requests && (
                          <div className="mt-2">
                            <span className="text-gray-600 text-sm">Special Requests:</span>
                            <p className="text-sm">{booking.special_requests}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bookings as Escort */}
            {escortBookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking Requests (as Escort)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {escortBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">
                              {booking.client_profile?.full_name || 'Client'}
                            </h3>
                            <p className="text-sm text-gray-600">{booking.service_type}</p>
                          </div>
                          <Badge className={getStatusColor(booking.status) + ' text-white'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p>{new Date(booking.booking_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <p>{booking.duration_hours} hours</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <p className="font-semibold">${booking.total_amount}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <p>{new Date(booking.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {booking.special_requests && (
                          <div className="mb-4">
                            <span className="text-gray-600 text-sm">Special Requests:</span>
                            <p className="text-sm">{booking.special_requests}</p>
                          </div>
                        )}
                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              size="sm"
                              variant="destructive"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {bookings.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No bookings yet</h3>
                  <p className="text-gray-500">Your bookings will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">
                            {message.sender_id === user.id 
                              ? `To: ${message.receiver?.full_name || 'Unknown'}`
                              : `From: ${message.sender?.full_name || 'Unknown'}`
                            }
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(message.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{message.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Earnings Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${escortBookings
                        .filter(b => b.status === 'completed')
                        .reduce((sum, b) => sum + Number(b.total_amount), 0)
                        .toFixed(2)
                      }
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ${escortBookings
                        .filter(b => {
                          const bookingDate = new Date(b.booking_date);
                          const now = new Date();
                          return b.status === 'completed' && 
                                 bookingDate.getMonth() === now.getMonth() &&
                                 bookingDate.getFullYear() === now.getFullYear();
                        })
                        .reduce((sum, b) => sum + Number(b.total_amount), 0)
                        .toFixed(2)
                      }
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Completed Bookings</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {escortBookings.filter(b => b.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
