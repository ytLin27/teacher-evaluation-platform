import React, { useState } from 'react';
import { Modal, Button } from '../ui';
import { useToast } from '../../contexts/ToastContext';

const AddResearchForm = ({ isOpen, onClose, onSuccess, initialType = 'publication' }) => {
  const [formData, setFormData] = useState({
    type: initialType === 'Journal Article' ? 'Journal Article' : 'Conference Paper',
    title: '',
    venue: '',
    date: '',
    impact: '',
    citations: '',
    status: 'Published',
    url: ''
  });

  const { showSuccess, showError } = useToast();

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

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.impact && (isNaN(formData.impact) || parseFloat(formData.impact) < 0)) {
      newErrors.impact = 'Impact factor must be a positive number';
    }

    if (formData.citations && (isNaN(formData.citations) || parseInt(formData.citations) < 0)) {
      newErrors.citations = 'Citation count must be a positive number';
    }

    if (formData.url && !formData.url.match(/^https?:\/\/.+/)) {
      newErrors.url = 'URL must be a valid web address starting with http:// or https://';
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
      const payload = {
        teacherId: 1, // Hardcoded for demo
        title: formData.title.trim(),
        type: formData.type,
        venue: formData.venue.trim(),
        status: formData.status,
        date: formData.date,
        citations: formData.citations ? parseInt(formData.citations) : 0,
        impact: formData.impact ? parseFloat(formData.impact) : 0,
        url: formData.url.trim()
      };

      const response = await fetch('http://localhost:3001/api/publications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();

        // Reset form
        setFormData({
          type: initialType === 'Journal Article' ? 'Journal Article' : 'Conference Paper',
          title: '',
          venue: '',
          date: '',
          impact: '',
          citations: '',
          status: 'Published',
          url: ''
        });
        setErrors({});

        // Call success callback
        if (onSuccess) {
          onSuccess(result);
        }

        showSuccess('Publication added successfully!');
        onClose();
      } else {
        const errorData = await response.json();
        showError(`Failed to add publication: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding publication:', error);
      showError('Failed to add publication due to network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: initialType === 'Journal Article' ? 'Journal Article' : 'Conference Paper',
      title: '',
      venue: '',
      date: '',
      impact: '',
      citations: '',
      status: 'Published',
      url: ''
    });
    setErrors({});
    onClose();
  };

  // Debug log
  React.useEffect(() => {
    console.log('AddResearchForm render - isOpen:', isOpen);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <Modal.Title>Add Publication</Modal.Title>
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="Journal Article">Journal Article</option>
              <option value="Conference Paper">Conference Paper</option>
              <option value="Book Chapter">Book Chapter</option>
              <option value="Preprint">Preprint</option>
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter publication title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Journal name, conference, or publisher"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="Published">Published</option>
              <option value="Under Review">Under Review</option>
              <option value="In Press">In Press</option>
              <option value="Submitted">Submitted</option>
              <option value="In Preparation">In Preparation</option>
            </select>
            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Citations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Citations
              </label>
              <input
                type="number"
                min="0"
                name="citations"
                value={formData.citations}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.citations ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.citations && <p className="text-red-500 text-xs mt-1">{errors.citations}</p>}
            </div>

            {/* Impact Factor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impact Factor
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.impact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.impact && <p className="text-red-500 text-xs mt-1">{errors.impact}</p>}
            </div>
          </div>

          {/* DOI/URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DOI/URL
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.url ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://doi.org/... or https://..."
            />
            {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
          </div>
        </form>
      </Modal.Content>

      <Modal.Footer>
        <Button variant="outline" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Adding...' : 'Add Publication'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddResearchForm;