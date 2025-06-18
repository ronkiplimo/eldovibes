
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  onClose: () => void;
}

const AdvancedSearch = ({ onSearch, onClose }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    minAge: 18,
    maxAge: 50,
    minRate: 0,
    maxRate: 1000,
    verifiedOnly: false,
    availableOnly: true,
    services: [] as string[]
  });

  const categories = [
    'Companion',
    'Entertainment',
    'Social Events',
    'Travel Companion',
    'Other'
  ];

  const services = [
    'Dinner Companion',
    'Event Escort',
    'Travel Companion',
    'Social Events',
    'Entertainment',
    'Massage',
    'Dancing',
    'Personal Training'
  ];

  const handleServiceToggle = (service: string) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      category: '',
      minAge: 18,
      maxAge: 50,
      minRate: 0,
      maxRate: 1000,
      verifiedOnly: false,
      availableOnly: true,
      services: []
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Search
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City or area..."
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age Range */}
          <div>
            <Label>Age Range: {filters.minAge} - {filters.maxAge} years</Label>
            <div className="px-2 mt-2">
              <Slider
                min={18}
                max={60}
                step={1}
                value={[filters.minAge, filters.maxAge]}
                onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minAge: min, maxAge: max }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Rate Range */}
          <div>
            <Label>Hourly Rate: ${filters.minRate} - ${filters.maxRate}</Label>
            <div className="px-2 mt-2">
              <Slider
                min={0}
                max={2000}
                step={25}
                value={[filters.minRate, filters.maxRate]}
                onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minRate: min, maxRate: max }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verifiedOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verifiedOnly: !!checked }))}
              />
              <Label htmlFor="verified">Verified profiles only</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="available"
                checked={filters.availableOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, availableOnly: !!checked }))}
              />
              <Label htmlFor="available">Available now</Label>
            </div>
          </div>

          {/* Services */}
          <div>
            <Label className="text-base font-medium">Services</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {services.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={filters.services.includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <Label htmlFor={service} className="text-sm">
                    {service}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={resetFilters} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleSearch} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSearch;
