import React, { useState } from 'react';
import { Modal, Button } from '../ui';

const AddResearchForm = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'publication',
    title: '',
    description: '',
    date: '',
    impact_factor: '',
    citation_count: '',
    funding_amount: '',
    status: 'published',
    url: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (formData.impact_factor && isNaN(formData.impact_factor)) {
      newErrors.impact_factor = 'Impact factor must be a number';
    }

    if (formData.citation_count && isNaN(formData.citation_count)) {
      newErrors.citation_count = 'Citation count must be a number';
    }

    if (formData.funding_amount && isNaN(formData.funding_amount)) {
      newErrors.funding_amount = 'Funding amount must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/teachers/1/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          impact_factor: formData.impact_factor ? parseFloat(formData.impact_factor) : null,
          citation_count: formData.citation_count ? parseInt(formData.citation_count) : 0,
          funding_amount: formData.funding_amount ? parseFloat(formData.funding_amount) : null
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Reset form
        setFormData({
          type: 'publication',
          title: '',
          description: '',
          date: '',
          impact_factor: '',
          citation_count: '',
          funding_amount: '',
          status: 'published',
          url: ''
        });
        setErrors({});

        // Call success callback
        if (onSuccess) {
          onSuccess(result.data);
        }

        // Show success message
        alert('Research item added successfully!');
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Failed to add research item: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding research item:', error);
      alert('Failed to add research item due to network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: 'publication',
      title: '',
      description: '',
      date: '',
      impact_factor: '',
      citation_count: '',
      funding_amount: '',
      status: 'published',
      url: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <Modal.Title>Add Research Item</Modal.Title>
      </Modal.Header>

      <Modal.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="publication">Publication</option>
              <option value="grant">Grant</option>
              <option value="patent">Patent</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter description"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Conditional fields based on type */}
          {formData.type === 'publication' && (
            <>
              {/* Impact Factor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impact Factor
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="impact_factor"
                  value={formData.impact_factor}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.impact_factor ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 3.45"
                />
                {errors.impact_factor && <p className="text-red-500 text-xs mt-1">{errors.impact_factor}</p>}
              </div>

              {/* Citation Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Citation Count
                </label>
                <input
                  type="number"
                  name="citation_count"
                  value={formData.citation_count}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.citation_count ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 25"
                />
                {errors.citation_count && <p className="text-red-500 text-xs mt-1">{errors.citation_count}</p>}
              </div>
            </>
          )}

          {formData.type === 'grant' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funding Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                name="funding_amount"
                value={formData.funding_amount}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.funding_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 150000"
              />
              {errors.funding_amount && <p className="text-red-500 text-xs mt-1">{errors.funding_amount}</p>}
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="published">Published</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://..."
            />
          </div>
        </form>
      </Modal.Content>

      <Modal.Footer>
        <Button variant="outline" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Adding...' : 'Add Research Item'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddResearchForm;