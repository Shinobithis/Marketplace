import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Clock, Eye, MessageCircle } from 'lucide-react';

const ListingCard = ({ listing, onFavorite }) => {
  console.log("ListingCard received listing:", listing);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(Boolean(listing.is_favorited));

  // Sync with prop changes
  useEffect(() => {
    console.log("ListingCard useEffect - listing.is_favorited:", listing.is_favorited);
    setIsFavorited(Boolean(listing.is_favorited));
  }, [listing.is_favorited]);

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
    if (listing.primary_image) {
      return listing.primary_image;
    }
    if (listing.primaryImage) {
      return listing.primaryImage;
    }
    return null;
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("User not authenticated. Cannot favorite.");
        setIsLoading(false);
        return;
      }

      const method = isFavorited ? "DELETE" : "POST";
      console.log(`Attempting to ${isFavorited ? 'unfavorite' : 'favorite'} listing with ID:`, listing.id);
      console.log("Current isFavorited state:", isFavorited);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/favorites/${listing.id}`, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log("Favorite response:", responseData);
        
        // Update local state based on the response
        if (responseData.data && typeof responseData.data.is_favorited === 'boolean') {
          setIsFavorited(responseData.data.is_favorited);
        } else {
          // Fallback: toggle the state
          setIsFavorited(!isFavorited);
        }
        
        // Call parent callback to update parent state
        if (onFavorite) {
          await onFavorite(listing.id);
        }
      } else if (response.status === 409) {
        // Handle conflict - item already favorited/unfavorited
        console.log("Conflict response - item already in desired state");
        // For conflict, we should check what the current state actually is
        // by making a separate request or handling it differently
        const errorData = await response.json();
        console.log("Conflict error data:", errorData);
        
        // If we get a conflict on POST, it means it's already favorited
        // If we get a conflict on DELETE, it means it's already not favorited
        if (method === "POST") {
          setIsFavorited(true);
        } else {
          setIsFavorited(false);
        }
      } else {
        const errorData = await response.json();
        console.error("Failed to toggle favorite:", errorData.message);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
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
              src={`${import.meta.env.VITE_API_BASE_URL}${listing.primary_image || 
                  (listing.images && listing.images.length > 0 ? listing.images[0].image_url : 
                 `uploads/icons/placeholder.svg`)}`}
              alt={listing.title}
              className="w-full h-full object-cover rounded-t-lg"
              onError={(e) => { e.target.onerror = null; e.target.src = `${import.meta.env.VITE_API_BASE_URL}uploads/icons/placeholder.svg`; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" 
                   fill="none" 
                   viewBox="0 0 24 24" 
                   strokeWidth={1.5} 
                   stroke="currentColor" 
                   className="w-12 h-12 mx-auto mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span className="text-sm">No image</span>
              </div>
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors disabled:opacity-50"
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isFavorited 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-600 hover:text-red-400'
            }`} 
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