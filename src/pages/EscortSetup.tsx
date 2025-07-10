import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Heart, Shield, Camera, DollarSign, MapPin, Clock, AlertTriangle, CheckCircle, CreditCard, ArrowLeft } from 'lucide-react';
import { getAllServices } from '@/utils/escortServices';
import { eldoretLocations } from '@/utils/locations';

const EscortSetup = () => {
  const { user } = useAuth();
  const { data: membership } = useMembership();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    stage_name: '',
    bio: '',
    age: '',
    hourly_rate: '',
    location: '',
    phone_number: '',
    category: '',
    services_offered: [] as string[],
    profile_image_url: ''
  });

  // Fetch existing escort profile with better error handling
  const { data: escortProfile, isLoading, error, refetch } = useQuery({
    queryKey: ['escort-profile-setup', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('EscortSetup fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('escort_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('EscortSetup profile fetch error:', error);
        throw error;
      }
      
      console.log('EscortSetup profile data:', data);
      return data;
    },
    enabled: !!user?.id,
    retry: (failureCount, error: any) => {
      // Retry up to 3 times, but not for PGRST116 (no rows found)
      if (error?.code === 'PGRST116') return false;
      return failureCount < 3;
    },
    retryDelay: 1000,
  });

  // Populate form with existing data
  useEffect(() => {
    if (escortProfile) {
      console.log('Populating form with profile data:', escortProfile);
      setFormData({
        stage_name: escortProfile.stage_name || '',
        bio: escortProfile.bio || '',
        age: escortProfile.age?.toString() || '',
        hourly_rate: escortProfile.hourly_rate?.toString() || '',
        location: escortProfile.location || '',
        phone_number: escortProfile.phone_number || '',
        category: escortProfile.category || '',
        services_offered: escortProfile.services_offered || [],
        profile_image_url: escortProfile.profile_image_url || ''
      });
    }
  }, [escortProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log('Updating escort profile with data:', data);
      
      const { error } = await supabase
        .from('escort_profiles')
        .update({
          stage_name: data.stage_name,
          bio: data.bio,
          age: parseInt(data.age),
          hourly_rate: parseInt(data.hourly_rate),
          location: data.location,
          phone_number: data.phone_number,
          category: data.category,
          services_offered: data.services_offered,
          profile_image_url: data.profile_image_url,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['escort-profile-setup'] });
      queryClient.invalidateQueries({ queryKey: ['escort-profile', user?.id] });
      toast({
        title: 'Profile Updated!',
        description: 'Your escort profile has been saved successfully.',
      });
    },
    onError: (error) => {
      console.error('Profile update mutation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services_offered: prev.services_offered.includes(serviceId)
        ? prev.services_offered.filter(s => s !== serviceId)
        : [...prev.services_offered, serviceId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.stage_name || !formData.bio || !formData.age || !formData.hourly_rate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  const getProfileStatus = () => {
    if (!escortProfile) return { 
      status: 'not_created', 
      label: 'Not Created', 
      color: 'gray', 
      description: 'Profile not found',
      emoji: '❌'
    };
    
    const isComplete = escortProfile.stage_name && escortProfile.bio && escortProfile.age && escortProfile.hourly_rate;
    const isPremium = membership?.status === 'paid';
    
    if (!isComplete) return { 
      status: 'incomplete', 
      label: 'Created – Setup Required', 
      color: 'yellow', 
      description: 'Complete all required fields to proceed',
      emoji: '✅'
    };
    
    if (!isPremium) return { 
      status: 'needs_premium', 
      label: 'Created – Not Yet Listed', 
      color: 'orange', 
      description: 'Upgrade to Premium to publish your profile',
      emoji: '✅'
    };
    
    if (!escortProfile.verified) return { 
      status: 'pending', 
      label: 'Pending Approval', 
      color: 'blue', 
      description: 'Your profile is under admin review',
      emoji: '🕓'
    };
    
    return { 
      status: 'live', 
      label: 'Listed', 
      color: 'green', 
      description: 'Your profile is active and visible to clients',
      emoji: '🌐'
    };
  };

  const isProfileComplete = () => {
    return formData.stage_name && formData.bio && formData.age && formData.hourly_rate && formData.location;
  };

  const profileStatus = getProfileStatus();
  const isPremium = membership?.status === 'paid';
  const allServices = getAllServices();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && error.code !== 'PGRST116') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load escort profile. Please try again.
            </AlertDescription>
          </Alert>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!escortProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No escort profile found. Please go back to the dashboard and click "Create Escort Profile" first.
            </AlertDescription>
          </Alert>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button onClick={() => refetch()}>
              Check Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Escort Profile Setup</h1>
          <p className="text-gray-600">Complete your profile to start connecting with clients</p>
          
          <div className="flex items-center gap-2 mt-4">
            <Badge 
              variant={profileStatus.color === 'green' ? 'default' : 'secondary'}
              className={`
                ${profileStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${profileStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                ${profileStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                ${profileStatus.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
                ${profileStatus.color === 'green' ? 'bg-green-100 text-green-800' : ''}
              `}
            >
              {profileStatus.emoji} Profile Status: {profileStatus.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">{profileStatus.description}</p>
        </div>

        {/* Premium Upgrade Alert */}
        {isProfileComplete() && !isPremium && (
          <Alert className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CreditCard className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>🎉 Profile Ready! Upgrade to Premium to Go Live!</strong>
                  <p className="text-sm mt-1">
                    Your escort profile is complete. Upgrade to Premium for KES 800/month to publish it and start earning.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="ml-4 border-orange-300 text-orange-800 hover:bg-orange-100"
                  onClick={() => navigate('/dashboard')}
                >
                  Upgrade Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Complete but waiting for approval */}
        {isPremium && profileStatus.status === 'pending' && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Under Review:</strong> Your profile is complete and payment confirmed. 
              Our team is reviewing your profile and will approve it within 24 hours.
            </AlertDescription>
          </Alert>
        )}

        {/* Profile is live */}
        {profileStatus.status === 'live' && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>🌐 Congratulations!</strong> Your escort profile is now live and visible to clients. 
              You can start receiving bookings and messages.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stage_name">Stage Name *</Label>
                  <Input
                    id="stage_name"
                    value={formData.stage_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, stage_name: e.target.value }))}
                    placeholder="Your professional name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="65"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Your age"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your location" />
                    </SelectTrigger>
                    <SelectContent>
                      {eldoretLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="+254..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate (KES) *</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    min="1000"
                    step="100"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    placeholder="5000"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="profile_image_url">Profile Image URL</Label>
                  <Input
                    id="profile_image_url"
                    type="url"
                    value={formData.profile_image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, profile_image_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About You</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="bio">Bio / Description *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell potential clients about yourself, your personality, and what makes you special..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {allServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.id}
                      checked={formData.services_offered.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <Label htmlFor={service.id} className="text-sm">
                      {service.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EscortSetup;
