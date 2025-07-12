
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import ImageUpload from '@/components/ImageUpload';
import Navbar from '@/components/Navbar';
import { eldoretLocations } from '@/utils/locations';
import { escortServices } from '@/utils/escortServices';

interface EscortProfileData {
  stageName: string;
  bio: string;
  age: number;
  category: string;
  servicesOffered: string[];
  hourlyRate: number;
  location: string;
  phoneNumber: string;
  dateOfBirth: string;
  profileImageUrl: string | null;
}

const availableServices = [
  'Companionship',
  'Erotic Massage',
  'GFE (Girlfriend Experience)',
  'PSE (Pornstar Experience)',
  'Travel Companion',
  'Dinner Dates',
  'Overnight Dates',
  'BDSM',
  'Roleplay',
  'Couples',
];

const EscortSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<EscortProfileData>({
    stageName: '',
    bio: '',
    age: 18,
    category: '',
    servicesOffered: [],
    hourlyRate: 500,
    location: '',
    phoneNumber: '',
    dateOfBirth: new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    profileImageUrl: null,
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileData: EscortProfileData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating profile with data:', profileData);

      const { data, error } = await supabase
        .from('escort_profiles')
        .insert({
          user_id: user.id,
          stage_name: profileData.stageName,
          bio: profileData.bio,
          age: profileData.age,
          category: profileData.category,
          services_offered: profileData.servicesOffered,
          hourly_rate: profileData.hourlyRate,
          location: profileData.location,
          phone_number: profileData.phoneNumber,
          date_of_birth: profileData.dateOfBirth,
          profile_image_url: profileData.profileImageUrl,
          verified: false, // Profile starts as unverified until payment
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Profile creation error:', error);
        throw error;
      }

      console.log('Profile created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Profile creation successful, invalidating queries');
      
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['escort-profile'] });
      queryClient.invalidateQueries({ queryKey: ['escort-profile-membership'] });
      queryClient.invalidateQueries({ queryKey: ['escort-profile-upgrade'] });
      
      toast({
        title: 'Profile Created Successfully!',
        description: 'Your escort profile has been created. Redirecting you to complete payment...',
      });
      
      // Add a small delay before redirect to ensure user sees the success message
      setTimeout(() => {
        console.log('Redirecting to membership page');
        navigate('/membership');
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Profile creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create profile',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Submitting profile creation with data:', formData);
    createProfileMutation.mutate(formData);
  };

  const isFormValid = (): boolean => {
    const { stageName, bio, age, category, hourlyRate, location, phoneNumber, dateOfBirth } = formData;
    return (
      !!stageName &&
      !!bio &&
      age >= 18 &&
      !!category &&
      hourlyRate >= 500 && hourlyRate <= 10000 &&
      !!location &&
      !!phoneNumber &&
      !!dateOfBirth
    );
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Escort Profile</h1>
          <p className="text-gray-600">
            Complete your profile with all details, then proceed with payment to make it visible to clients.
          </p>
        </div>

        {/* Profile Creation Process */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Profile Creation Process:</h3>
                <ol className="text-blue-800 text-sm space-y-1">
                  <li>1. Fill in all your profile details (photos, services, contact info)</li>
                  <li>2. Save your complete profile</li>
                  <li>3. Complete payment (KES 800/month) to activate your profile</li>
                  <li>4. Your profile becomes visible to clients after payment</li>
                </ol>
                <p className="text-blue-700 text-xs mt-2">
                  Note: Your profile will be saved but remain hidden until payment is completed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="stageName">Stage Name *</Label>
                <Input
                  id="stageName"
                  value={formData.stageName}
                  onChange={(e) => setFormData(prev => ({ ...prev, stageName: e.target.value }))}
                  placeholder="Your professional name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="65"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell clients about yourself..."
                className="min-h-24"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
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
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (KES) *</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="500"
                  max="10000"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 2000"
                  required
                />
                <p className="text-xs text-gray-500">Rate must be between KES 500 - 10,000</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="0700000000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Services Offered</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableServices.map((service) => (
                  <label key={service} className="flex items-center space-x-2 text-sm">
                    <Checkbox
                      checked={formData.servicesOffered.includes(service)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            servicesOffered: [...prev.servicesOffered, service]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            servicesOffered: prev.servicesOffered.filter(s => s !== service)
                          }));
                        }
                      }}
                    />
                    <span>{service}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Profile Image *</Label>
              <ImageUpload
                currentImageUrl={formData.profileImageUrl || undefined}
                onImageUpload={(url) => setFormData(prev => ({ ...prev, profileImageUrl: url }))}
                onImageRemove={() => setFormData(prev => ({ ...prev, profileImageUrl: null }))}
              />
              <p className="text-xs text-gray-500">Upload a professional photo to attract more clients</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 mb-2">💡 Next Steps</h4>
              <ul className="text-amber-800 text-sm space-y-1">
                <li>• Your profile will be saved with all details you've entered</li>
                <li>• After saving, you'll be redirected to complete payment (KES 800/month)</li>
                <li>• Once payment is confirmed, your profile becomes visible to clients</li>
                <li>• Clients can then view, contact, and book your services</li>
              </ul>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createProfileMutation.isPending || !isFormValid()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {createProfileMutation.isPending ? 'Saving Profile...' : 'Save Profile & Continue to Payment'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EscortSetup;
