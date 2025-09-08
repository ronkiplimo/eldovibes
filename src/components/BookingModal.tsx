
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatCurrency } from '@/hooks/useEscorts';

interface BookingModalProps {
  escort: any;
  onClose: () => void;
}

const BookingModal = ({ escort, onClose }: BookingModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_type: '',
    booking_date: '',
    duration_hours: 1,
    special_requests: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const totalAmount = (formData.duration_hours * (escort.hourly_rate || 0));
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          client_id: user.id,
          escort_id: escort.user_id,
          service_type: formData.service_type,
          booking_date: formData.booking_date,
          duration_hours: formData.duration_hours,
          total_amount: totalAmount,
          special_requests: formData.special_requests
        });

      if (error) throw error;

      toast.success('Booking request sent successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = formData.duration_hours * (escort.hourly_rate || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[95vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">Book {escort.stage_name}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="service_type" className="text-sm font-medium">Service Type *</Label>
              <Select 
                value={formData.service_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
                required
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="companion">Companion</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="social-event">Social Event</SelectItem>
                  <SelectItem value="travel">Travel Companion</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="booking_date" className="text-sm font-medium">Date & Time *</Label>
              <Input
                id="booking_date"
                type="datetime-local"
                value={formData.booking_date}
                onChange={(e) => setFormData(prev => ({ ...prev, booking_date: e.target.value }))}
                required
                min={new Date().toISOString().slice(0, 16)}
                className="h-11"
              />
            </div>

            <div>
              <Label htmlFor="duration_hours" className="text-sm font-medium">Duration (hours) *</Label>
              <Select 
                value={formData.duration_hours.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration_hours: parseInt(value) }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8, 12, 24].map(hours => (
                    <SelectItem key={hours} value={hours.toString()}>
                      {hours} hour{hours > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="special_requests" className="text-sm font-medium">Special Requests</Label>
              <Textarea
                id="special_requests"
                placeholder="Any special requests or notes..."
                value={formData.special_requests}
                onChange={(e) => setFormData(prev => ({ ...prev, special_requests: e.target.value }))}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm sm:text-base">Total Amount:</span>
                <span className="text-xl sm:text-2xl font-bold text-red-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                {formData.duration_hours} hour{formData.duration_hours > 1 ? 's' : ''} × {formatCurrency(escort.hourly_rate)}/hr
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.service_type || !formData.booking_date}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 h-11"
              >
                {loading ? 'Booking...' : 'Book Now'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingModal;
