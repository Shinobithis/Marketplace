import React, { useEffect, useState } from 'react';
import ListingCard from '../components/listings/ListingCard';

const FreeItemsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFreeItems = async () => {
      try {
        // Fetch listings where is_free is true
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/listings?is_free=1`);
        const data = await response.json();

        if (response.ok && data.success) {
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

    fetchFreeItems();
  }, []);

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
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FreeItemsPage;
