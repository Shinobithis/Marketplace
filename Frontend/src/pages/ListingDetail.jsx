import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast: showToast } = useToast();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/listings/${id}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setListing(data.data);
        } else {
          showToast(data.message || 'Failed to fetch listing', 'error');
          navigate('/listings');
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        showToast('Network error or server unreachable.', 'error');
        navigate('/listings');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id, navigate, showToast]);

  const handleContactSeller = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast('Please log in to contact the seller', 'error');
      navigate('/login');
      return;
    }

    if (!message.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: listing.id,
          receiver_id: listing.user_id,
          message: message.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        showToast('Message sent successfully!', 'success');
        setMessage('');
        setShowContactForm(false);
        setMessageSent(true);
      } else {
        showToast(data.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Network error or server unreachable.', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatCondition = (condition) => {
    return condition.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Listing Not Found</h1>
          <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/listings')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Listings
          </button>
        </div>
      </div>
    );
  }

  const images = listing.images || [];
  const hasImages = images.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {hasImages ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${images[currentImageIndex]?.image_url || 
                  '/placeholder-image.svg'}`}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Image thumbnails */}
            {hasImages && images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${image.image_url}`}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Posted {formatDate(listing.created_at)}</span>
                <span>•</span>
                <span>{listing.views_count || 0} views</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">
                {formatPrice(listing.price)}
              </div>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {formatCondition(listing.condition_type)}
              </div>
            </div>

            <div className="border-t border-b py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{listing.category_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{listing.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seller:</span>
                <span className="font-medium">
                  {listing.first_name && listing.last_name 
                    ? `${listing.first_name} ${listing.last_name}`
                    : listing.username || 'Unknown Seller'
                  }
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {/* Contact Seller Section */}
            {isAuthenticated && user?.id !== listing.user_id && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Contact Seller</h3>
                
                {messageSent ? (
                  <div className="text-center py-4">
                    <div className="text-green-600 mb-2">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-green-800 font-medium mb-2">Message sent successfully!</p>
                    <p className="text-gray-600 text-sm mb-4">The seller will receive your message. You can continue the conversation in your messages.</p>
                    <button
                      onClick={() => navigate('/messages')}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Messages
                    </button>
                  </div>
                ) : !showContactForm ? (
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Send Message
                  </button>
                ) : (
                  <form onSubmit={handleContactSeller} className="space-y-4">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hi! I'm interested in this item..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      required
                    />
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={sendingMessage}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {sendingMessage ? 'Sending...' : 'Send Message'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <p className="text-blue-800 mb-4">Sign in to contact the seller</p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}

            {isAuthenticated && user?.id === listing.user_id && (
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <p className="text-green-800 mb-4">This is your listing</p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => navigate(`/edit-listing/${listing.id}`)}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Edit Listing
                  </button>
                  <button
                    onClick={() => navigate('/messages')}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Messages
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;

