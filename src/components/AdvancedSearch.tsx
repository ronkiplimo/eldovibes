
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';
import { eldoretLocations } from '@/utils/locations';
import { escortServices, getAllServices } from '@/utils/escortServices';

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

  const categories = escortServices.map(cat => ({
    id: cat.id,
    name: cat.name,
    emoji: cat.emoji
  }));

  const services = getAllServices();

  const handleServiceToggle = (serviceId: string) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleSearch = () => {
    const processedFilters = {
      ...filters,
      location: filters.location === 'all' ? '' : filters.location,
      category: filters.category === 'all' ? '' : filters.category
    };
    onSearch(processedFilters);
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
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Search - EldoVibes Escort Services
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-800 mb-2">
              <strong>Explore a wide range of high-class escort services</strong> designed to suit every desire, fantasy, and mood. 
              Our companions offer personalized experiences, from sensual relaxation to adventurous encounters.
            </p>
            <p className="text-xs text-purple-600">
              🚨 <strong>Note:</strong> All services are offered at the discretion of the individual escort and may vary. 
              Please respect boundaries and confirm availability in advance. Safety and consent are our top priorities.
            </p>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {eldoretLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Service Category</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select service category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.emoji} {category.name}
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

          {/* Services by Category */}
          <div>
            <Label className="text-base font-medium">Specific Services</Label>
            <div className="space-y-4 mt-3 max-h-60 overflow-y-auto">
              {escortServices.map((category) => (
                <div key={category.id} className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <span className="text-lg">{category.emoji}</span>
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {category.services.map((service) => (
                      <div key={service.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={service.id}
                          checked={filters.services.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <Label htmlFor={service.id} className="text-xs leading-tight">
                          {service.name}
                        </Label>
                      </div>
                    ))}
                  </div>
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
