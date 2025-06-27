import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CreateListingPage = () => {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [conditionType, setConditionType] = useState('');
    const [location, setLocation] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        if (!isAuthenticated) {
          toast.error("You need to be logged in to create a listing.");
          navigate('/login');
        }

        const fetchCategories = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`);
            const data = await response.json();
            if (response.ok && data.success) {
              setCategories(data.data);
            } else {
              toast.error(data.message || "Failed to fetch categories");
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error("Network error or server unreachable for categories.");
        }
        };
        fetchCategories();
    }, [isAuthenticated, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(); 
    formData.append("title", title); 
    formData.append("description", description); 
    formData.append("price", parseFloat(price)); 
    formData.append("category_id", parseInt(categoryId)); 
    formData.append("condition_type", conditionType); 
    formData.append("location", location);

    selectedFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
    });
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/listings`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Listing created successfully!");
        setTitle('');
        setDescription('');
        setPrice('');
        setCategoryId('');
        setConditionType('');
        setLocation('');
        setSelectedFiles([]);
        console.log("Navigating to:", `/listing/${data.data.id}`);
        navigate(`/listing/${data.data.id}`);
      } else {
        toast.error(data.message || "Failed to create listing");
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error("Network error or server unreachable.");
    } finally {
      setLoading(false);
    }
    };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Create New Listing</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
          <textarea
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Price:</label>
          <input
            type="number"
            id="price"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Category:</label>
          <select
            id="category"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="condition" className="block text-gray-700 text-sm font-bold mb-2">Condition:</label>
          <select
            id="condition"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={conditionType}
            onChange={(e) => setConditionType(e.target.value)}
            required
          >
            <option value="">Select condition</option>
            <option value="new">New</option>
            <option value="like_new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">Location:</label>
          <input
            type="text"
            id="location"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="mb-4"> 
            <label htmlFor="images" className="block text-gray-700 text-sm font-bold mb-2">Images:</label> 
            <input 
                type="file" 
                id="images" 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                multiple
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))} 
            /> 
            {selectedFiles.length > 0 && ( <p className="text-gray-600 text-xs mt-1">{selectedFiles.length} file(s) selected</p> )}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white cursor-pointer font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListingPage;
