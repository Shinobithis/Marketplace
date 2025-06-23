import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ListingCard from '../components/listings/ListingCard';
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react';

const Home = () => {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/listings/featured`);
        const data = await response.json();
        if (response.ok && data.success) {
          setFeaturedListings(data.data);
        } else {
          console.error("Failed to fetch featured listings:", data.message);
        }
      } catch (error) {
        console.error("Error fetching featured listings:", error);
      }
    };
    fetchFeaturedListings();

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories/counts`);
        const data = await response.json();
        if (response.ok && data.success) {
          setCategories(data.data); // This will now include listing_count
        } else {
          console.error("Failed to fetch categories:", data.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

  fetchCategories();
  }, []);

  const handleSearch = (e) => {
  e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/listings?search=${encodeURIComponent(searchQuery)}`;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Buy, Sell, Give
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Discover amazing deals in your community. Find what you need or sell what you don't.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white text-gray-900"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 bg-white text-blue-600 hover:bg-gray-100">
                Search
              </Button>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/listings">
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Browse All Items
              </Button>
            </Link>
            <Link to="/free">
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Free Items
              </Button>
            </Link>
            <Link to="/create-listing">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Categories</h2>
            <p className="text-lg text-gray-600">Find exactly what you're looking for</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/listings?category=${category.id}`}
                className="group"
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500"><span className="text-sm text-gray-500">({category.listing_count})</span>items</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Items</h2>
              <p className="text-lg text-gray-600">Handpicked deals you don't want to miss</p>
            </div>
            <Link to="/listings">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onFavorite={(id) => console.log('Favorited:', id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-lg text-gray-300">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-lg text-gray-300">Items Sold</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25K+</div>
              <div className="text-lg text-gray-300">Free Items Given</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Getting started is easy</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Browse & Search</h3>
              <p className="text-gray-600">Find items you need using our powerful search and filtering tools.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Connect & Chat</h3>
              <p className="text-gray-600">Message sellers directly to ask questions and arrange meetups.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Meet & Exchange</h3>
              <p className="text-gray-600">Meet safely in public places to complete your transaction.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

