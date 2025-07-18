
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

  let escorts = advancedFilters ? advancedResults : (isSearching ? searchResults : allEscorts);
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar />
      
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-8 md:py-20 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 break-words">
            Welcome to EldoVibes
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto px-2 break-words">
            Connect with premium companions for unforgettable experiences in Eldoret and beyond
          </p>
          
          <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col gap-3 md:gap-4 w-full">
                {/* Location and Category */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full">
                  <div className="flex-1 min-w-0">
                    <Select value={searchLocation} onValueChange={setSearchLocation}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white h-12 w-full">
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
                  <div className="flex-1 min-w-0">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white h-12 w-full">
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
                
                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-2 w-full">
                  <Button 
                    onClick={handleSearch}
                    className="bg-white text-purple-600 hover:bg-gray-100 h-12 text-base flex-1 min-w-0"
                    disabled={isLoading}
                  >
                    <Search className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Search</span>
                  </Button>
                  <Button
                    onClick={() => setShowAdvancedSearch(true)}
                    variant="outline"
                    className="border-2 border-white bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm h-12 sm:w-auto min-w-0"
                  >
                    <Filter className="w-4 h-4 sm:mr-0 md:mr-2 flex-shrink-0" />
                    <span className="sm:hidden md:inline ml-1">Filters</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 md:mt-8 px-4">
            <Button 
              onClick={handleBecomeEscort}
              className="bg-white text-purple-600 hover:bg-gray-100 text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 w-full sm:w-auto max-w-full break-words"
            >
              <span className="block sm:inline">Become an Escort - Start Earning Today</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Escorts */}
      <section className="py-8 sm:py-12 md:py-16 bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 break-words">
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

      {showAdvancedSearch && (
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}

      <EldoVibesAssistant />
      <Footer />
    </div>
  );
};

export default Index;
