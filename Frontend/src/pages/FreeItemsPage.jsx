import React, { useEffect, useState } from 'react';
import ListingCard from '../components/listings/ListingCard';

const FreeItemsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFreeItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Use both is_free=1 and price filters to catch all free items
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/listings?is_free=1`, {
        headers: headers
      });
      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Free items data received:", data.data.listings);
        
        // Additional client-side filtering to ensure we only get truly free items
        const freeItems = data.data.listings.filter(listing => {
          const price = parseFloat(listing.price);
          const isFree = listing.is_free === 1 || listing.is_free === "1";
          return price === 0 || isFree;
        });
        
        console.log("Filtered free items:", freeItems);
        setListings(freeItems);
      } else {
        setError(data.message || 'Failed to fetch free items');
      }
    } catch (err) {
      setError('Network error or server unreachable');
      console.error('Error fetching free items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreeItems();
  }, []);

  const handleFavoriteToggle = async (listingId) => {
    console.log("FreeItemsPage handleFavoriteToggle called for listing:", listingId);
    
    // Update the local state immediately for better UX
    setListings(prevListings =>
      prevListings.map(l =>
        l.id === listingId ? { ...l, is_favorited: !l.is_favorited } : l
      )
    );

    // Optionally refresh the data from server to ensure consistency
    setTimeout(() => {
      fetchFreeItems();
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading free items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
          <button 
            onClick={fetchFreeItems}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Free Items</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover amazing free items in your community. All items shown here are completely free!
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Found {listings.length} free item{listings.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {listings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No free items available</h3>
          <p className="text-gray-600 mb-4">Check back later for new free items from the community.</p>
          <button 
            onClick={fetchFreeItems}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              onFavorite={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FreeItemsPage;