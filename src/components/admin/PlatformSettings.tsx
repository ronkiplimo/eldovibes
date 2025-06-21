
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePlatformSettings, useUpdateSetting } from '@/hooks/useAdmin';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PlatformSettings = () => {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdateSetting();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  const handleSave = async (key: string, value: any) => {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast({
        title: 'Success',
        description: 'Setting updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive'
      });
    }
  };

  const getSettingValue = (key: string, defaultValue: any) => {
    if (localSettings.hasOwnProperty(key)) {
      return localSettings[key];
    }
    const setting = settings?.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const updateLocalSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="maintenance">Maintenance Mode</Label>
              <p className="text-sm text-gray-500">
                Enable to put the platform in maintenance mode
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="maintenance"
                checked={getSettingValue('maintenance_mode', false)}
                onCheckedChange={(checked) => {
                  updateLocalSetting('maintenance_mode', checked);
                  handleSave('maintenance_mode', checked);
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="registration">Registration Enabled</Label>
              <p className="text-sm text-gray-500">
                Allow new users to register on the platform
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="registration"
                checked={getSettingValue('registration_enabled', true)}
                onCheckedChange={(checked) => {
                  updateLocalSetting('registration_enabled', checked);
                  handleSave('registration_enabled', checked);
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="verification">Escort Verification Required</Label>
              <p className="text-sm text-gray-500">
                Require admin verification for new escort profiles
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="verification"
                checked={getSettingValue('escort_verification_required', true)}
                onCheckedChange={(checked) => {
                  updateLocalSetting('escort_verification_required', checked);
                  handleSave('escort_verification_required', checked);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="commission">Platform Commission Rate (%)</Label>
            <div className="flex gap-2">
              <Input
                id="commission"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={getSettingValue('platform_commission_rate', 0.15)}
                onChange={(e) => updateLocalSetting('platform_commission_rate', parseFloat(e.target.value))}
                className="flex-1"
              />
              <Button
                onClick={() => handleSave('platform_commission_rate', getSettingValue('platform_commission_rate', 0.15))}
                disabled={updateSetting.isPending}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimum">Minimum Booking Amount ($)</Label>
            <div className="flex gap-2">
              <Input
                id="minimum"
                type="number"
                min="0"
                value={getSettingValue('minimum_booking_amount', 50)}
                onChange={(e) => updateLocalSetting('minimum_booking_amount', parseInt(e.target.value))}
                className="flex-1"
              />
              <Button
                onClick={() => handleSave('minimum_booking_amount', getSettingValue('minimum_booking_amount', 50))}
                disabled={updateSetting.isPending}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="upload">Maximum Upload Size (MB)</Label>
            <div className="flex gap-2">
              <Input
                id="upload"
                type="number"
                min="1"
                max="100"
                value={getSettingValue('max_upload_size_mb', 10)}
                onChange={(e) => updateLocalSetting('max_upload_size_mb', parseInt(e.target.value))}
                className="flex-1"
              />
              <Button
                onClick={() => handleSave('max_upload_size_mb', getSettingValue('max_upload_size_mb', 10))}
                disabled={updateSetting.isPending}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformSettings;
