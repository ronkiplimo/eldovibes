
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Users, Shield, Filter } from 'lucide-react';
import Navbar from '@/components/Navbar';
import EscortListings from '@/components/EscortListings';
import AdvancedSearch from '@/components/AdvancedSearch';
import { useEscorts, useSearchEscorts } from '@/hooks/useEscorts';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useAuth } from '@/hooks/useAuth';
import { eldoretLocations } from '@/utils/locations';
import { escortServices } from '@/utils/escortServices';
import Footer from '@/components/Footer';
import EldoVibesAssistant from '@/components/EldoVibesAssistant';

const Index = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: allEscorts, isLoading: loadingAll } = useEscorts();
  const { data: searchResults, isLoading: loadingSearch } = useSearchEscorts(
    isSearching && !advancedFilters ? (searchLocation === 'all' ? '' : searchLocation) : undefined,
    isSearching && !advancedFilters ? (selectedCategory === 'all' ? '' : selectedCategory) : undefined
  );
  const { data: advancedResults, isLoading: loadingAdvanced } = useAdvancedSearch(
    advancedFilters || {},
    !!advancedFilters
  );

  const escorts = advancedFilters ? advancedResults : (isSearching ? searchResults : allEscorts);
  const isLoading = advancedFilters ? loadingAdvanced : (isSearching ? loadingSearch : loadingAll);

  const handleSearch = () => {
    setIsSearching(true);
    setAdvancedFilters(null);
  };

  const handleAdvancedSearch = (filters: any) => {
    setAdvancedFilters(filters);
    setIsSearching(true);
  };

  const clearFilters = () => {
    setSearchLocation('');
    setSelectedCategory('');
    setIsSearching(false);
    setAdvancedFilters(null);
  };

  const handleBecomeEscort = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/membership');
  };

  const categories = escortServices.map(cat => ({
    id: cat.id,
    name: cat.name,
    emoji: cat.emoji
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section - Optimized for mobile */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
            Welcome to EldoVibes
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto px-2">
            Connect with premium companions for unforgettable experiences in Eldoret and beyond
          </p>
          
          {/* Search Bar - Mobile optimized */}
          <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col gap-3 md:gap-4">
                {/* Location and Category - Stack on mobile */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <div className="flex-1">
                    <Select value={searchLocation} onValueChange={setSearchLocation}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white h-12">
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
                  <div className="flex-1">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white h-12">
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
                </div>
                
                {/* Buttons - Stack on mobile */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-2">
                  <Button 
                    onClick={handleSearch}
                    className="bg-white text-purple-600 hover:bg-gray-100 h-12 text-base flex-1"
                    disabled={isLoading}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button
                    onClick={() => setShowAdvancedSearch(true)}
                    variant="outline"
                    className="border-2 border-white bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm h-12 sm:w-auto"
                  >
                    <Filter className="w-4 h-4 sm:mr-0 md:mr-2" />
                    <span className="sm:hidden md:inline">Filters</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Become an Escort CTA - Mobile optimized */}
          <div className="mt-6 md:mt-8 px-4">
            <Button 
              onClick={handleBecomeEscort}
              className="bg-white text-purple-600 hover:bg-gray-100 text-base md:text-lg px-6 md:px-8 py-3 w-full sm:w-auto"
            >
              Become an Escort - Start Earning Today
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Escorts */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {isSearching ? 'Search Results' : 'Featured Companions'}
            </h2>
            {(isSearching || advancedFilters) && (
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-4">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full sm:w-auto"
                >
                  Clear Filters
                </Button>
                {advancedFilters && (
                  <Badge variant="secondary" className="text-sm w-full sm:w-auto justify-center">
                    Advanced filters applied
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <EscortListings escorts={escorts} isLoading={isLoading} />
        </div>
      </section>

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}

      {/* EldoVibes Assistant */}
      <EldoVibesAssistant />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
