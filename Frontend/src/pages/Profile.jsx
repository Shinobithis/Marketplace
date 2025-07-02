import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const [userListings, setUserListings] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    username: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab");
    if (tab && ["profile", "listings", "favorites"].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("profile");
    }

    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        username: user.username || ""
      });
    }
  }, [user, isAuthenticated, navigate, location.search]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUserListings = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/listings/my`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          setUserListings(data.data || []);
        } else {
          toast.error(data.message || 'Failed to fetch your listings', 'error');
        }
      } catch (error) {
        console.error('Error fetching user listings:', error);
        toast.error('Network error or server unreachable.', 'error');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserFavorites = async () => {
      setLoading(true);
      try {
        const apiUrl = new URL("favorites/user", import.meta.env.VITE_API_BASE_URL).href;
        const response = await fetch(apiUrl, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          console.log("User favorites data:", data.data);
          setUserFavorites(data.data || []);
        } else {
          toast.error(data.message || "Failed to fetch your favorites", "error");
        }
      } catch (error) {
        console.error("Error fetching user favorites:", error);
        toast.error("Network error or server unreachable.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'listings') {
      fetchUserListings();
    } else if (activeTab === 'favorites') {
      fetchUserFavorites();
    }
  }, [activeTab, user, isAuthenticated, toast]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        updateUser(data.data);
        setIsEditing(false);
        toast.success('Profile updated successfully!', 'success');
      } else {
        toast.error(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Network error or server unreachable.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteListing = async (listingId, type = 'listing') => {
    if (type === 'favorite') {
      if (!confirm('Are you sure you want to remove this listing from your favorites?')) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to delete this listing?')) {
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      let response;
      if (type === 'favorite') {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/favorites/${listingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/listings/${listingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      const data = await response.json();
      
      if (response.ok && data.success) {
        if (type === 'favorite') {
          setUserFavorites(userFavorites.filter(listing => listing.id !== listingId));
          toast.success('Listing removed from favorites successfully!', 'success');
        } else {
          setUserListings(userListings.filter(listing => listing.id !== listingId));
          toast.success('Listing deleted successfully!', 'success');
        }
      } else {
        toast.error(data.message || `Failed to ${type === 'favorite' ? 'remove from favorites' : 'delete listing'}`, 'error');
      }
    } catch (error) {
      console.error(`Error ${type === 'favorite' ? 'removing from favorites' : 'deleting listing'}:`, error);
      toast.error('Network error or server unreachable.', 'error');
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'listings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Listings
            </button>
                        <button
              onClick={() => setActiveTab("favorites")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "favorites"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Favorites
            </button>
          </nav>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        first_name: user.first_name || '',
                        last_name: user.last_name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        username: user.username || ''
                      });
                    }}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <p className="text-gray-900">{user?.first_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <p className="text-gray-900">{user?.last_name || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <p className="text-gray-900">{user?.username}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-900">{formatDate(user?.created_at)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Listings</h2>
              <button
                onClick={() => navigate('/create-listing')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create New Listing
              </button>
            </div>
            {loading ? (
              <p>Loading listings...</p>
            ) : userListings.length === 0 ? (
              <p>You have no listings yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${listing.primary_image.substring(1)}`}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300'; }}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{listing.description}</p>
                      <p className="text-gray-900 font-bold text-lg mb-4">{formatPrice(listing.price)}</p>
                      <div className="flex justify-between items-center">
                        <Link
                          to={`/listing/${listing.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleDeleteListing(listing.id, 'listing')}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete Listing
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">My Favorites</h2>
            {loading ? (
              <p>Loading favorites...</p>
            ) : userFavorites.length === 0 ? (
              <p>You have no favorite listings yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userFavorites.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${listing.primary_image.substring(1)}`}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300'; }}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{listing.description}</p>
                      <p className="text-gray-900 font-bold text-lg mb-4">{formatPrice(listing.price)}</p>
                      <div className="flex justify-between items-center">
                        <Link
                          to={`/listing/${listing.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleDeleteListing(listing.id, 'favorite')}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Favorite
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;