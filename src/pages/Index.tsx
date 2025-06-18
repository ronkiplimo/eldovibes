
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Star, Shield, Users, Search, Filter, Phone, Clock, Verified } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All", count: 45 },
    { id: "companions", name: "Companions", count: 20 },
    { id: "massage", name: "Massage", count: 15 },
    { id: "entertainment", name: "Entertainment", count: 10 },
  ];

  const featuredProfiles = [
    {
      id: 1,
      name: "Sophia",
      age: 24,
      location: "Eldoret Central",
      rating: 4.9,
      reviews: 23,
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=600&fit=crop",
      price: "KSh 5,000",
      verified: true,
      online: true,
    },
    {
      id: 2,
      name: "Grace",
      age: 26,
      location: "Pioneer Estate",
      rating: 4.8,
      reviews: 18,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=600&fit=crop",
      price: "KSh 4,500",
      verified: true,
      online: false,
    },
    {
      id: 3,
      name: "Diana",
      age: 22,
      location: "Kapsoya",
      rating: 4.7,
      reviews: 31,
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=600&fit=crop",
      price: "KSh 6,000",
      verified: true,
      online: true,
    },
  ];

  const handleSearch = () => {
    toast({
      title: "Search initiated",
      description: `Searching for "${searchQuery}" in ${selectedCategory} category`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-200/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  EldoVibes
                </h1>
                <p className="text-xs text-gray-500">Premium Directory</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-amber-600">
                Sign In
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                Join Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Discover Premium
              <span className="block bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Companionship
              </span>
              in Eldoret
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Connect with verified, professional companions in Eldoret. 
              Discreet, secure, and premium experiences await.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 mb-12 max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, location, or services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 text-lg border-2 border-gray-200 focus:border-amber-400"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="lg" className="border-2 border-gray-200 hover:border-amber-400">
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                  </Button>
                  <Button 
                    size="lg" 
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Verified Profiles</h4>
                <p className="text-sm text-gray-600">100% Authentic</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-gray-900">45+ Companions</h4>
                <p className="text-sm text-gray-600">Active Profiles</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-gray-900">4.8★ Rating</h4>
                <p className="text-sm text-gray-600">Client Satisfaction</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                <p className="text-sm text-gray-600">Always Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Browse Categories</h3>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="lg"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0" 
                  : "border-2 border-gray-200 hover:border-amber-400"
                }
              >
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Featured Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProfiles.map((profile) => (
              <Card key={profile.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="relative">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {profile.verified && (
                      <Badge className="bg-green-500 text-white">
                        <Verified className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {profile.online && (
                      <Badge className="bg-amber-500 text-white">
                        Online
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="font-bold text-amber-600">{profile.price}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{profile.name}</h4>
                      <p className="text-amber-600 font-medium">Age {profile.age}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{profile.rating}</span>
                      <span className="text-gray-500">({profile.reviews})</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                      View Profile
                    </Button>
                    <Button variant="outline" size="icon" className="border-2 border-gray-200 hover:border-amber-400">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">EldoVibes</h3>
              </div>
              <p className="text-gray-400">
                Premium companionship directory serving Eldoret and surrounding areas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Browse Profiles</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Register</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="text-gray-400 space-y-2">
                <p>M-PESA: Till 9009227</p>
                <p>Eldoret, Kenya</p>
                <p>Available 24/7</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EldoVibes. All rights reserved. • Ages 18+ Only</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
