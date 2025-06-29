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

      // Fetch listings where is_free is true
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/listings?is_free=1`, {
        headers: headers
      });
      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Free items data received:", data.data.listings);
        setListings(data.data.listings);
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
    return <div className="min-h-screen flex items-center justify-center">Loading free items...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Free Items</h1>
      {listings.length === 0 ? (
        <p className="text-center text-gray-600">No free items found.</p>
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