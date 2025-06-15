import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Clock, Eye } from 'lucide-react';

const ListingCard = ({ listing, onFavorite, isFavorited = false }) => {
  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `$${price.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        {/* Image */}
        <div className="aspect-square bg-gray-200 overflow-hidden">
          {listing.primaryImage ? (
            <img
              src={listing.primaryImage}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <img 
                src="/src/assets/placeholder-product.png" 
                alt="No image available" 
                className="w-16 h-16 opacity-50"
              />
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onFavorite?.(listing.id);
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <Heart 
            className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </button>

        {/* Price Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge 
            variant={listing.price === 0 ? "secondary" : "default"}
            className="bg-white/90 text-gray-900 hover:bg-white"
          >
            {formatPrice(listing.price)}
          </Badge>
        </div>

        {/* Condition Badge */}
        {listing.condition && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-white/90">
              {listing.condition}
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
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(listing.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src={listing.seller?.avatar || '/api/placeholder/32/32'}
                alt={listing.seller?.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-600">{listing.seller?.name}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Eye className="h-3 w-3" />
              <span>{listing.views || 0}</span>
            </div>
          </div>
        </Link>

        <div className="mt-3 pt-3 border-t">
          <Button 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              // Handle contact seller
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

