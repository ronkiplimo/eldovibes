
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';

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

  // Fetch existing profile if editing
  const { data: existingProfile, isLoading } = useQuery({
    queryKey: ['escort-profile-edit', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('escort_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching existing profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id && isEditing,
  });

  // Load existing profile data when editing
  useEffect(() => {
    if (existingProfile && isEditing) {
      setFormData({
        stageName: existingProfile.stage_name || '',
        bio: existingProfile.bio || '',
        age: existingProfile.age || 18,
        category: existingProfile.category || '',
        servicesOffered: existingProfile.services_offered || [],
        hourlyRate: existingProfile.hourly_rate || 500,
        location: existingProfile.location || '',
        phoneNumber: existingProfile.phone_number || '',
        dateOfBirth: existingProfile.date_of_birth || new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        profileImageUrl: existingProfile.profile_image_url || null,
      });
    }
  }, [existingProfile, isEditing]);

  const createOrUpdateProfileMutation = useMutation({
    mutationFn: async (profileData: EscortProfileData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating/updating profile with data:', profileData);

      const profilePayload = {
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
        is_active: true
      };

      if (isEditing && existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('escort_profiles')
          .update(profilePayload)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Profile update error:', error);
          throw new Error(error.message || 'Failed to update profile');
        }

        console.log('Profile updated successfully:', data);
        return data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('escort_profiles')
          .insert(profilePayload)
          .select()
          .single();

        if (error) {
          console.error('Profile creation error:', error);
          throw new Error(error.message || 'Failed to create profile');
        }

        console.log('Profile created successfully:', data);
        return data;
      }
    },
    onSuccess: (data) => {
      console.log('Profile operation successful:', data);
      
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['escort-profile'] });
      queryClient.invalidateQueries({ queryKey: ['escort-profile-membership'] });
      queryClient.invalidateQueries({ queryKey: ['escort-profile-upgrade'] });
      queryClient.invalidateQueries({ queryKey: ['escort-profile-edit'] });
      queryClient.invalidateQueries({ queryKey: ['escort-profile-payment'] });
      queryClient.invalidateQueries({ queryKey: ['membership'] });
      
      // Show success message
      toast({
        title: isEditing ? 'Profile Updated Successfully!' : 'Profile Created Successfully!',
        description: isEditing ? 'Your changes have been saved.' : 'Your profile has been saved permanently. Complete payment to make it visible to clients.',
      });
      
      // FIXED: Always redirect appropriately
      if (isEditing) {
        // If editing, go back to dashboard
        navigate('/dashboard');
      } else {
        // If creating new profile, ALWAYS go to payment page
        console.log('Redirecting to payment page for new profile');
        navigate('/payment');
      }
    },
    onError: (error: any) => {
      console.error('Profile operation error:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile',
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

    console.log('Submitting profile operation with data:', formData);
    createOrUpdateProfileMutation.mutate(formData);
  };

  const isFormValid = (): boolean => {
    const { stageName, bio, age, category, hourlyRate, location, phoneNumber, dateOfBirth } = formData;
    return (
      stageName.trim() !== '' &&
      bio.trim() !== '' &&
      age >= 18 &&
      category !== '' &&
      hourlyRate >= 500 && hourlyRate <= 10000 &&
      location !== '' &&
      phoneNumber.trim() !== '' &&
      dateOfBirth !== ''
    );
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (isLoading && isEditing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your profile...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Your Escort Profile' : 'Create Your Escort Profile'}
          </h1>
          <p className="text-gray-600">
            {isEditing 
              ? 'Update your profile details below. Your changes will be saved immediately.'
              : 'Complete your profile with all details. Your profile will be saved permanently and you can publish it with payment.'
            }
          </p>
        </div>

        {!isEditing && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Profile Creation Process:</h3>
                  <ol className="text-green-800 text-sm space-y-1">
                    <li>1. Fill in all your profile details (photos, services, contact info)</li>
                    <li>2. Save your complete profile (it will be stored permanently)</li>
                    <li>3. Complete payment to make your profile visible to clients</li>
                    <li>4. Your profile goes live immediately after payment</li>
                  </ol>
                  <p className="text-green-700 text-xs mt-2">
                    Note: Your profile is saved permanently even without payment. You can edit it anytime.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Update Your Profile Information' : 'Complete Your Profile Information'}</CardTitle>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 500 }))}
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 {isEditing ? 'Profile Update' : 'Profile Saving'}</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                {isEditing ? (
                  <>
                    <li>• Your profile changes will be saved immediately</li>
                    <li>• If your profile is published, changes will be visible to clients</li>
                    <li>• You can edit your profile anytime, even after publishing</li>
                  </>
                ) : (
                  <>
                    <li>• Your profile will be saved permanently with all details</li>
                    <li>• You'll be redirected to the payment page to activate your profile</li>
                    <li>• Your profile remains saved even if you don't pay immediately</li>
                    <li>• You can edit your profile anytime after saving</li>
                  </>
                )}
              </ul>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createOrUpdateProfileMutation.isPending || !isFormValid()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {createOrUpdateProfileMutation.isPending 
                ? (isEditing ? 'Updating Profile...' : 'Saving Profile...') 
                : (isEditing ? 'Update Profile' : 'Save Profile & Continue to Payment')
              }
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EscortSetup;
