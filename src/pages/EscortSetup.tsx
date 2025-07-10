
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Save, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { validateHourlyRate } from '@/hooks/useEscorts';
import { useToast } from '@/hooks/use-toast';
import { eldoretLocations } from '@/utils/locations';
import { escortServices } from '@/utils/escortServices';

const EscortSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: membership } = useMembership();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [stageName, setStageName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState('');
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('available');

  // Fetch existing escort profile
  const { data: escortProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['escort-profile-setup', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching escort profile for user:', user.id);
      const { data, error } = await supabase
        .from('escort_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching escort profile:', error);
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      console.log('Escort profile data:', data);
      return data;
    },
    enabled: !!user?.id
  });

  // Update form when profile loads
  useEffect(() => {
    if (escortProfile) {
      setStageName(escortProfile.stage_name || '');
      setBio(escortProfile.bio || '');
      setAge(escortProfile.age?.toString() || '');
      setHourlyRate(escortProfile.hourly_rate?.toString() || '');
      setLocation(escortProfile.location || '');
      setPhoneNumber(escortProfile.phone_number || '');
      setCategory(escortProfile.category || '');
      setServicesOffered(escortProfile.services_offered || []);
      setProfileImageUrl(escortProfile.profile_image_url || '');
      setAvailabilityStatus(escortProfile.availability_status || 'available');
    }
  }, [escortProfile]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log('Saving escort profile:', profileData);
      
      const { data, error } = await supabase
        .from('escort_profiles')
        .upsert({
          user_id: user.id,
          stage_name: profileData.stageName,
          bio: profileData.bio,
          age: profileData.age ? parseInt(profileData.age) : null,
          hourly_rate: profileData.hourlyRate ? parseFloat(profileData.hourlyRate) : null,
          location: profileData.location,
          phone_number: profileData.phoneNumber,
          category: profileData.category,
          services_offered: profileData.servicesOffered,
          profile_image_url: profileData.profileImageUrl,
          availability_status: profileData.availabilityStatus,
          updated_at: new Date().toISOString(),
          verified: false // Keep as false until payment is completed
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving escort profile:', error);
        throw error;
      }
      
      console.log('Profile saved successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escort-profile'] });
      queryClient.invalidateQueries({ queryKey: ['escort-profile-setup'] });
      toast({
        title: 'Profile Saved!',
        description: 'Your escort profile has been updated successfully.',
      });
      
      // If not paid, redirect to membership page
      if (membership?.status !== 'paid') {
        toast({
          title: 'Complete Your Setup',
          description: 'Please upgrade to Premium to activate your profile.',
        });
        setTimeout(() => {
          navigate('/membership');
        }, 2000);
      }
    },
    onError: (error: any) => {
      console.error('Failed to save profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleSave = async () => {
    // Validation
    if (!stageName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Stage name is required.',
        variant: 'destructive'
      });
      return;
    }

    if (hourlyRate && !validateHourlyRate(parseFloat(hourlyRate))) {
      toast({
        title: 'Validation Error',
        description: 'Hourly rate must be between KES 500 and KES 10,000.',
        variant: 'destructive'
      });
      return;
    }

    await saveProfileMutation.mutateAsync({
      stageName,
      bio,
      age,
      hourlyRate,
      location,
      phoneNumber,
      category,
      servicesOffered,
      profileImageUrl,
      availabilityStatus
    });
  };

  const handleServiceToggle = (serviceId: string) => {
    setServicesOffered(prev => 
      prev.includes(serviceId) 
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const isProfileComplete = stageName && bio && age && hourlyRate;
  const isPaidMember = membership?.status === 'paid';

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (profileError && (profileError as any).code !== 'PGRST116') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Profile</h2>
              <p className="text-gray-600 mb-4">There was an error loading your escort profile.</p>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Escort Profile Setup</h1>
            <p className="text-gray-600">
              {escortProfile ? 'Update your profile information' : 'Create your escort profile'}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className={`w-6 h-6 ${isProfileComplete ? 'text-green-500' : 'text-orange-500'}`} />
                <div>
                  <h3 className="font-semibold">
                    {isProfileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isPaidMember 
                      ? (isProfileComplete ? 'Your profile is active and listed' : 'Complete all fields to activate')
                      : (isProfileComplete ? 'Complete payment to activate your profile' : 'Complete profile, then upgrade to Premium')
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={isProfileComplete ? 'default' : 'secondary'}>
                  {isProfileComplete ? 'Complete' : 'In Progress'}
                </Badge>
                {isPaidMember && (
                  <Badge className="bg-green-100 text-green-800">
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stageName">Stage Name *</Label>
                  <Input
                    id="stageName"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="Enter your stage name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio/Description *</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell clients about yourself, your services, and what makes you special"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Your age"
                      min="18"
                      max="65"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (KES) *</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="500 - 10000"
                      min="500"
                      max="10000"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Location */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Your contact number"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your location" />
                    </SelectTrigger>
                    <SelectContent>
                      {eldoretLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Services & Category */}
            <Card>
              <CardHeader>
                <CardTitle>Services & Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your category" />
                    </SelectTrigger>
                    <SelectContent>
                      {escortServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.emoji} {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Services Offered</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {escortServices.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={service.id}
                          checked={servicesOffered.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                          className="rounded"
                        />
                        <label htmlFor={service.id} className="text-sm">
                          {service.emoji} {service.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  currentImageUrl={profileImageUrl}
                  onImageUpload={setProfileImageUrl}
                  onImageRemove={() => setProfileImageUrl('')}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card>
              <CardContent className="p-6">
                <Button 
                  onClick={handleSave}
                  disabled={saveProfileMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
                
                {!isPaidMember && isProfileComplete && (
                  <Button 
                    onClick={() => navigate('/membership')}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    Upgrade to Premium
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Profile Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Use a clear, professional profile photo</p>
                <p>• Write a detailed, honest bio</p>
                <p>• Set competitive but realistic rates</p>
                <p>• Keep your availability status updated</p>
                <p>• Respond promptly to messages</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscortSetup;
