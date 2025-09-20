import React, { useState } from 'react';
import { Modal, Button } from '../ui';

const AddServiceForm = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'committee',
    title: '',
    organization: '',
    role: '',
    start_date: '',
    end_date: '',
    description: '',
    workload_hours: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    if (formData.workload_hours && isNaN(formData.workload_hours)) {
      newErrors.workload_hours = 'Workload hours must be a number';
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
      const response = await fetch('http://localhost:3001/api/teachers/1/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          workload_hours: formData.workload_hours ? parseInt(formData.workload_hours) : null
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Reset form
        setFormData({
          type: 'committee',
          title: '',
          organization: '',
          role: '',
          start_date: '',
          end_date: '',
          description: '',
          workload_hours: ''
        });
        setErrors({});

        if (onSuccess) {
          onSuccess(result.data);
        }

        alert('Service contribution added successfully!');
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Failed to add service contribution: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding service contribution:', error);
      alert('Failed to add service contribution due to network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: 'committee',
      title: '',
      organization: '',
      role: '',
      start_date: '',
      end_date: '',
      description: '',
      workload_hours: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <Modal.Title>Add Service Contribution</Modal.Title>
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
              <option value="committee">Committee</option>
              <option value="review">Review</option>
              <option value="community">Community</option>
              <option value="editorial">Editorial</option>
              <option value="advisory">Advisory</option>
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

          {/* Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter organization"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Chair, Member, Reviewer"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty if ongoing</p>
          </div>

          {/* Workload Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workload Hours
            </label>
            <input
              type="number"
              name="workload_hours"
              value={formData.workload_hours}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.workload_hours ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 40"
            />
            {errors.workload_hours && <p className="text-red-500 text-xs mt-1">{errors.workload_hours}</p>}
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
        </form>
      </Modal.Content>

      <Modal.Footer>
        <Button variant="outline" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Adding...' : 'Add Service'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddServiceForm;