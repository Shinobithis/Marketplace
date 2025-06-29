import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ListingCard from '../components/listings/ListingCard';

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search');

    let apiUrl = `${import.meta.env.VITE_API_BASE_URL}/listings`;
    if (searchQuery) {
      apiUrl += `${apiUrl.includes('?') ? '&' : '?'}search=${encodeURIComponent(searchQuery)}`;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(apiUrl, {
        headers: headers
      });
      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Data received from /listings API:", data.data.listings);
        setListings(data.data.listings || []);
      } else {
        setError(data.message || 'Failed to fetch listings');
        setListings([]);
      }
    } catch (err) {
      setError('Network error or server unreachable');
      console.error('Error fetching listings:', err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [location.search]);

  const handleFavoriteToggle = async (listingId) => {
    console.log("ListingsPage handleFavoriteToggle called for listing:", listingId);
    
    // Update the local state immediately for better UX
    setListings(prevListings =>
      prevListings.map(l =>
        l.id === listingId ? { ...l, is_favorited: !l.is_favorited } : l
      )
    );

    // Optionally refresh the data from server to ensure consistency
    setTimeout(() => {
      fetchListings();
    }, 500);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading listings...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">All Listings</h1>
      {listings.length === 0 ? (
        <p className="text-center text-gray-600">No listings found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              onFavorite={handleFavoriteToggle}
            />
          ))}
          {console.log("Passing to ListingCard:", listings)}
        </div>
      )}
    </div>
  );
};

export default ListingsPage;