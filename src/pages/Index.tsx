
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
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to EldoVibes
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Connect with premium companions for unforgettable experiences in Eldoret and beyond
          </p>
          
          {/* Search Bar */}
          <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Select value={searchLocation} onValueChange={setSearchLocation}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
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
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
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
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSearch}
                    className="bg-white text-purple-600 hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button
                    onClick={() => setShowAdvancedSearch(true)}
                    variant="outline"
                    className="border-2 border-white bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Become an Escort CTA */}
          <div className="mt-8">
            <Button 
              onClick={handleBecomeEscort}
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              Become an Escort - Start Earning Today
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose EldoVibes?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the finest companion services with our verified and professional escorts
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Verified Profiles</CardTitle>
                <CardDescription>
                  All our companions are thoroughly verified for your safety and peace of mind
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Star className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Premium Quality</CardTitle>
                <CardDescription>
                  Connect with high-class companions who provide exceptional experiences
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Discreet Service</CardTitle>
                <CardDescription>
                  Your privacy is our priority with secure messaging and confidential bookings
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Escorts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {isSearching ? 'Search Results' : 'Featured Companions'}
            </h2>
            {(isSearching || advancedFilters) && (
              <div className="flex justify-center gap-4 mb-4">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                {advancedFilters && (
                  <Badge variant="secondary" className="text-sm">
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
