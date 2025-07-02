import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  ShoppingBag, 
  User,
  Plus,
  Menu,
  X,
  Heart,
  Settings
} from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.first_name || user.username;
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4"> {/* Wrapper for logo and welcome message */}
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">BSG</span>
            </Link>

            {/* ADDED: Welcome message next to logo for logged-in users */}
            {isAuthenticated && (
              <div className="hidden lg:block text-sm text-gray-600">
                Welcome, {getUserDisplayName()}!
              </div>
            )}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search for items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/listings" className="text-gray-700 hover:text-primary transition-colors">
              All Items
            </Link>
            <Link to="/free" className="text-gray-700 hover:text-primary transition-colors">
              Free Items
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/create-listing">
                  <Button size="sm" className="flex items-center space-x-1 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    <span>Sell</span>
                  </Button>
                </Link>
                
                {/* REMOVED: MessageCircle Link */}
                
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors">
                    <User className="h-5 w-5" />
                    {/* FIXED: Display correct user name */}
                    <span>{getUserDisplayName()}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </div>
                    </Link>
                    <Link to="/profile?tab=listings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="h-4 w-4" />
                        <span>My Listings</span>
                      </div>
                    </Link>
                    <Link to="/profile?tab=favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4" />
                        <span>Favorites</span>
                      </div>
                    </Link>
                    {user.isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </div>
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <Link 
              to="/listings" 
              className="block py-2 text-gray-700 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              All Items
            </Link>
            <Link 
              to="/free" 
              className="block py-2 text-gray-700 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Free Items
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/create-listing" 
                  className="block py-2 text-gray-700 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sell Item
                </Link>
                
                {/* REMOVED: Mobile Messages Link */}

                <Link 
                  to="/profile" 
                  className="block py-2 text-gray-700 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-gray-700 hover:text-primary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block py-2 text-gray-700 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="block py-2 text-gray-700 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;