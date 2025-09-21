import React, { useState } from 'react';
import { Modal, Button } from '../ui';
import { useToast } from '../../contexts/ToastContext';

const AddCertificationForm = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expireDate: '',
    credentialId: '',
    credentialUrl: '',
    notes: ''
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

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Certification name is required';
    }
    if (!formData.issuer.trim()) {
      newErrors.issuer = 'Issuing organization is required';
    }
    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }

    // Date validation
    if (formData.issueDate && formData.expireDate) {
      const issueDate = new Date(formData.issueDate);
      const expireDate = new Date(formData.expireDate);

      if (expireDate < issueDate) {
        newErrors.expireDate = 'Expiration date must be after issue date';
      }
    }

    // URL validation
    if (formData.credentialUrl && !formData.credentialUrl.match(/^https?:\/\/.+/)) {
      newErrors.credentialUrl = 'URL must be a valid web address starting with http:// or https://';
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
        name: formData.name.trim(),
        issuer: formData.issuer.trim(),
        issueDate: formData.issueDate,
        expireDate: formData.expireDate || null,
        credentialId: formData.credentialId.trim() || null,
        credentialUrl: formData.credentialUrl.trim() || null,
        notes: formData.notes.trim() || null
      };

      const response = await fetch('http://localhost:3001/api/certifications', {
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
          name: '',
          issuer: '',
          issueDate: '',
          expireDate: '',
          credentialId: '',
          credentialUrl: '',
          notes: ''
        });
        setErrors({});

        // Call success callback
        if (onSuccess) {
          onSuccess(result);
        }

        showSuccess('Certification added successfully!');
        onClose();
      } else {
        const errorData = await response.json();
        showError(`Failed to add certification: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding certification:', error);
      showError('Failed to add certification due to network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      issuer: '',
      issueDate: '',
      expireDate: '',
      credentialId: '',
      credentialUrl: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  // Debug log
  React.useEffect(() => {
    console.log('AddCertificationForm render - isOpen:', isOpen);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <Modal.Title>Add Certification</Modal.Title>
      </Modal.Header>

      <Modal.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Certification Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certification Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., AWS Certified Solutions Architect"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Issuing Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issuing Organization *
            </label>
            <input
              type="text"
              name="issuer"
              value={formData.issuer}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.issuer ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Amazon Web Services, Google, Microsoft"
            />
            {errors.issuer && <p className="text-red-500 text-xs mt-1">{errors.issuer}</p>}
          </div>

          {/* Issue Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date *
            </label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.issueDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.issueDate && <p className="text-red-500 text-xs mt-1">{errors.issueDate}</p>}
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date
            </label>
            <input
              type="date"
              name="expireDate"
              value={formData.expireDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.expireDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.expireDate && <p className="text-red-500 text-xs mt-1">{errors.expireDate}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Credential ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credential ID
              </label>
              <input
                type="text"
                name="credentialId"
                value={formData.credentialId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., AWSSolArch-123456"
              />
            </div>

            {/* Credential URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credential URL
              </label>
              <input
                type="url"
                name="credentialUrl"
                value={formData.credentialUrl}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.credentialUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://..."
              />
              {errors.credentialUrl && <p className="text-red-500 text-xs mt-1">{errors.credentialUrl}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Additional information about this certification..."
            />
          </div>
        </form>
      </Modal.Content>

      <Modal.Footer>
        <Button variant="outline" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Adding...' : 'Add Certification'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddCertificationForm;