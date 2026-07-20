'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CATEGORIES } from '@/lib/categories';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('artworks');
  const [artworks, setArtworks] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    medium: '',
    dimensions: '',
    year_created: new Date().getFullYear(),
    price: '',
    status: 'Available',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch artworks
  useEffect(() => {
    if (activeTab === 'artworks') {
      fetchArtworks();
    } else if (activeTab === 'inquiries') {
      fetchInquiries();
    }
  }, [activeTab]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/artworks');
      const data = await res.json();
      setArtworks(data.artworks || []);
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
    }
    setLoading(false);
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    }
    setLoading(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e) => {
    const { value } = e.target;
    // Remove all commas and non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    
    // Add commas for thousands separator
    const parts = numericValue.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedValue = parts[1] ? `${integerPart}.${parts[1]}` : integerPart;
    
    setFormData((prev) => ({ 
      ...prev, 
      price: formattedValue || ''
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image_url;

      // Upload image if new one is selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          imageUrl = uploadData.url;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      // Convert price string (with commas) to number
      const priceValue = formData.price ? parseFloat(formData.price.replace(/,/g, '')) : 0;

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/artworks/${editingId}` : '/api/artworks';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, price: priceValue, image_url: imageUrl }),
      });

      if (res.ok) {
        fetchArtworks();
        resetForm();
        setShowForm(false);
      } else {
        alert('Failed to save artwork');
      }
    } catch (error) {
      console.error('Failed to save artwork:', error);
      alert('Error: ' + error.message);
    }
    setUploading(false);
  };

  const handleEdit = (artwork) => {
    setFormData({
      title: artwork.title,
      category: artwork.category,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      year_created: artwork.year_created,
      price: artwork.price,
      status: artwork.status,
      description: artwork.description,
      image_url: artwork.image_url,
    });
    setEditingId(artwork.id);
    setShowForm(true);
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;

    try {
      const res = await fetch(`/api/artworks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchArtworks();
      }
    } catch (error) {
      console.error('Failed to delete artwork:', error);
      alert('Failed to delete artwork');
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchInquiries();
      } else {
        alert('Failed to delete inquiry');
      }
    } catch (error) {
      console.error('Failed to delete inquiry:', error);
      alert('Failed to delete inquiry');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: CATEGORIES[0],
      medium: '',
      dimensions: '',
      year_created: new Date().getFullYear(),
      price: '',
      status: 'Available',
      description: '',
    });
    setImageFile(null);
    setEditingId(null);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-cream p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition text-sm md:text-base"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 border-b border-gray-300 flex overflow-x-auto">
        <button
          onClick={() => setActiveTab('artworks')}
          className={`px-4 md:px-6 py-3 md:py-4 font-semibold transition text-sm md:text-base whitespace-nowrap ${
            activeTab === 'artworks'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          Artworks
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 md:px-6 py-3 md:py-4 font-semibold transition text-sm md:text-base whitespace-nowrap ${
            activeTab === 'inquiries'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          Inquiries
        </button>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {activeTab === 'artworks' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-black">Manage Artworks</h2>
              {!showForm && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="w-full sm:w-auto px-6 py-2 bg-black text-cream rounded hover:bg-gray-800 transition text-sm md:text-base"
                >
                  + Add Artwork
                </button>
              )}
            </div>

            {showForm && (
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-300 mb-8">
                <h3 className="text-xl font-bold mb-6 text-black">
                  {editingId ? 'Edit Artwork' : 'Add New Artwork'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-black">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-black">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Medium */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-black">
                        Medium *
                      </label>
                      <input
                        type="text"
                        name="medium"
                        value={formData.medium}
                        onChange={handleFormChange}
                        required
                        placeholder="e.g., Oil on Canvas"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      />
                    </div>

                    {/* Dimensions */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-black">
                        Dimensions *
                      </label>
                      <input
                        type="text"
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleFormChange}
                        required
                        placeholder="e.g., 24 x 36 inches"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      />
                    </div>

                    {/* Year Created */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-black">
                        Year Created *
                      </label>
                      <input
                        type="number"
                        name="year_created"
                        value={formData.year_created}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-black">
                        Price (₱) {formData.status !== 'Display' ? '*' : ''}
                      </label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handlePriceChange}
                        required={formData.status !== 'Display'}
                        disabled={formData.status === 'Display'}
                        placeholder={formData.status === 'Display' ? 'N/A for Display items' : 'e.g., 20,000'}
                        className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black ${formData.status === 'Display' ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                      />
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2 text-black">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      >
                        <option>Available</option>
                        <option>Display</option>
                        <option>Sold</option>
                        <option>Reserved</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-black">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-black">
                      Image {editingId ? '(leave empty to keep current)' : '(required)'}
                    </label>
                    {editingId && formData.image_url && (
                      <div className="relative h-48 w-48 mb-4 rounded overflow-hidden">
                        <Image
                          src={formData.image_url}
                          alt="Current artwork"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!editingId}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-2 bg-black text-cream rounded hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      {uploading ? 'Saving...' : 'Save Artwork'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className="px-6 py-2 border border-gray-300 text-black rounded hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Artworks List */}
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : artworks.length > 0 ? (
              <div className="grid gap-4 md:gap-6">
                {artworks.map((artwork) => (
                  <div
                    key={artwork.id}
                    className="flex flex-col sm:flex-row gap-4 md:gap-6 bg-gray-50 p-4 md:p-4 rounded-lg border border-gray-300"
                  >
                    <div className="relative h-32 w-32 flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src={artwork.image_url}
                        alt={artwork.title}
                        fill
                        sizes="128px"
                        priority
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-black mb-2 truncate">
                        {artwork.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 mb-1">
                        {artwork.category} • {artwork.medium}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 mb-2">
                        {artwork.dimensions} • {artwork.year_created}
                      </p>
                      <p className="font-semibold text-black mb-2 text-sm md:text-base">
                        {artwork.status === 'Display' ? 'Display • ' : `₱${parseFloat(artwork.price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • `}
                        {artwork.status}
                      </p>
                    </div>

                    <div className="flex gap-2 items-start">
                      <button
                        onClick={() => handleEdit(artwork)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(artwork.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No artworks yet. Click &quot;Add Artwork&quot; to create one.</p>
            )}
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div>
            <h2 className="text-2xl font-bold mb-8 text-black">Inquiries</h2>

            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : inquiries.length > 0 ? (
              <div className="space-y-6">
                {inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="bg-gray-50 p-6 rounded-lg border border-gray-300"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Name</p>
                        <p className="font-semibold text-black">{inquiry.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-semibold text-black">
                          <a href={`mailto:${inquiry.email}`} className="hover:text-blue-600">
                            {inquiry.email}
                          </a>
                        </p>
                      </div>
                      {inquiry.artwork_id && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">About Artwork</p>
                          <p className="font-semibold text-black">ID: {inquiry.artwork_id}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Date</p>
                        <p className="text-black">
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Message</p>
                      <p className="text-black bg-white p-4 rounded border border-gray-200">
                        {inquiry.message}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleDeleteInquiry(inquiry.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No inquiries yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
