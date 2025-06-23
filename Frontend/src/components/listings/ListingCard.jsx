import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Clock, Eye, MessageCircle } from 'lucide-react';

const ListingCard = ({ listing, onFavorite, isFavorited = false }) => {
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price) => {
    if (price === 0 || price === '0.00') return 'Free';
    return `$${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Today';
      if (diffDays === 2) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCondition = (condition) => {
    if (!condition) return 'Unknown';
    return condition.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getSellerName = () => {
    if (listing.first_name && listing.last_name) {
      return `${listing.first_name} ${listing.last_name}`;
    }
    if (listing.username) {
      return listing.username;
    }
    return 'Unknown Seller';
  };

  const getImageUrl = () => {
    // Check for primary_image from the backend
    if (listing.primary_image) {
      return listing.primary_image;
    }
    // Check for primaryImage (frontend mock data)
    if (listing.primaryImage) {
      return listing.primaryImage;
    }
    // Return placeholder
    return null;
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onFavorite?.(listing.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const imageUrl = getImageUrl();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        {/* Image */}
        <div className="aspect-square bg-gray-200 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-full h-full flex items-center justify-center text-gray-400 ${imageUrl ? 'hidden' : 'flex'}`}
            style={{ display: imageUrl ? 'none' : 'flex' }}
          >
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">No image</span>
            </div>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors disabled:opacity-50"
        >
          <Heart 
            className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </button>

        {/* Price Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge 
            variant={listing.price === 0 || listing.price === '0.00' ? "secondary" : "default"}
            className="bg-white/90 text-gray-900 hover:bg-white"
          >
            {formatPrice(listing.price)}
          </Badge>
        </div>

        {/* Condition Badge */}
        {listing.condition_type && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-white/90">
              {formatCondition(listing.condition_type)}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <Link to={`/listing/${listing.id}`} className="block">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {listing.description}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{listing.location || 'Unknown location'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(listing.created_at || listing.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                {getSellerName().charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600">{getSellerName()}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{listing.views_count || listing.views || 0}</span>
              </div>
              {listing.message_count && (
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{listing.message_count}</span>
                </div>
              )}
            </div>
          </div>
        </Link>

        <div className="mt-3 pt-3 border-t">
          <Button 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/listing/${listing.id}`;
            }}
          >
            Contact Seller
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;

