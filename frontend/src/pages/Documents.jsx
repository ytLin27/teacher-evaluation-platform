import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, SearchBar, Pagination } from '../components/ui';
import { EmptyDocuments, EmptySearch, LoadingError, UploadError } from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0
  });
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useToast();

  // API base URL
  const API_BASE = 'http://localhost:3001/api';
  const TEACHER_ID = 1; // Default teacher ID for demo

  // Fetch documents from API
  const fetchDocuments = async (page = 1, search = '', tag = 'all') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        size: pagination.per_page.toString(),
        ...(search && { q: search }),
        ...(tag !== 'all' && { tag })
      });

      const response = await fetch(`${API_BASE}/documents/teacher/${TEACHER_ID}?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.data || []);
      setPagination(data.pagination || {
        current_page: 1,
        per_page: 12,
        total: 0,
        total_pages: 0
      });
    } catch (err) {
      setError(err.message);
      showError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available tags
  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_BASE}/documents/teacher/${TEACHER_ID}/tags`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags || []);
      }
    } catch (err) {
      console.warn('Failed to fetch tags:', err);
    }
  };

  const handlePageChange = (page) => {
    fetchDocuments(page, searchTerm, selectedTag);
  };

  useEffect(() => {
    fetchDocuments();
    fetchTags();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDocuments(1, searchTerm, selectedTag);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTag]);

  const getFileIcon = (type) => {
    if (type.includes('pdf')) {
      return (
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6l-4-4H4v16zm8-10v1h4v7H8v-7h4zm-2-2h2V4H6v12h4V8z"/>
        </svg>
      );
    } else if (type.includes('word')) {
      return (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 2h12l4 4v12H4V2zm8 2v4h4l-4-4z"/>
        </svg>
      );
    } else if (type.includes('presentation')) {
      return (
        <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 4h16v10H2V4zm14 8V6H4v6h12z"/>
        </svg>
      );
    } else if (type.includes('spreadsheet')) {
      return (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 3h14v14H3V3zm2 2v4h4V5H5zm6 0v4h4V5h-4zm-6 6v4h4v-4H5zm6 0v4h4v-4h-4z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };


  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('teacher_id', TEACHER_ID.toString());
      formData.append('tags', 'uploaded');

      const response = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      showSuccess(data.message || `${files.length} file(s) uploaded successfully!`);

      // Refresh documents list
      await fetchDocuments(1, searchTerm, selectedTag);
      await fetchTags();
    } catch (error) {
      showError(error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
    e.target.value = '';
  };

  const handlePreview = (document) => {
    // Open preview in new tab/window
    window.open(`${API_BASE}/documents/${document.id}/preview`, '_blank');
  };

  const handleDownload = (document) => {
    // Create download link
    const link = document.createElement('a');
    link.href = `${API_BASE}/documents/${document.id}/download`;
    link.download = document.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess(`Downloading ${document.name}...`);
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      showSuccess('Document deleted successfully');

      // Refresh documents list
      await fetchDocuments(pagination.current_page, searchTerm, selectedTag);
      await fetchTags();
    } catch (error) {
      showError(error.message || 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Document Library
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload, organize, and manage your documents
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button
            variant="outline"
            onClick={() => setShowUploadModal(true)}
          >
            Upload Files
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <Card.Content>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="font-medium text-purple-600 hover:text-purple-500"
                  >
                    Click to upload
                  </button>
                  {' '}or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, PPT, XLS up to 50MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              />
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Filters and View Controls */}
      <Card>
        <Card.Content className="py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search documents..."
              />
            </div>
            <div className="flex items-center space-x-4">
              {/* Tag Filter */}
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="all">All Tags</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium rounded-l-md border ${viewMode === 'grid'
                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${viewMode === 'list'
                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Documents Display */}
      <div className="text-sm text-gray-600 mb-4">
        {pagination.total} document(s) found
      </div>

      {error ? (
        <LoadingError
          error={error}
          onRetry={() => fetchDocuments(pagination.current_page, searchTerm, selectedTag)}
        />
      ) : documents.length === 0 && !loading ? (
        searchTerm || selectedTag !== 'all' ? (
          <EmptySearch
            searchTerm={searchTerm}
            onClear={() => {
              setSearchTerm('');
              setSelectedTag('all');
            }}
          />
        ) : (
          <EmptyDocuments onUpload={() => fileInputRef.current?.click()} />
        )
      ) : documents.length === 0 ? (
        <EmptyDocuments onUpload={() => fileInputRef.current?.click()} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Card.Content className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(document.mime_type)}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {document.name}
                      </h3>
                      <p className="text-xs text-gray-500">{formatFileSize(document.file_size)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {(document.tags || []).map((tag) => (
                    <Badge key={tag} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Uploaded {formatDate(document.uploaded_at)}</span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(document)}
                    className="flex-1"
                  >
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(document)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(document.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Card.Content className="p-0">
            <div className="divide-y divide-gray-200">
              {documents.map((document, index) => (
                <div key={document.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {getFileIcon(document.mime_type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {document.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">{formatFileSize(document.file_size)}</span>
                          <span className="text-xs text-gray-500">
                            Uploaded {formatDate(document.uploaded_at)}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {(document.tags || []).map((tag) => (
                              <Badge key={tag} variant="secondary" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(document)}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(document)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(document.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.per_page}
          onPageChange={handlePageChange}
        />
      )}

      {/* Preview Modal */}
      {previewDocument && (
        <Modal
          isOpen={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          title={`Preview: ${previewDocument.name}`}
          size="lg"
        >
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              {getFileIcon(previewDocument.mime_type)}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {previewDocument.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              File preview will open in a new tab. In a production application,
              this would show an embedded preview.
            </p>
            <div className="space-x-3">
              <Button
                variant="outline"
                onClick={() => handlePreview(previewDocument)}
              >
                Open Preview
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDownload(previewDocument)}
              >
                Download Document
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Loading Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-gray-900">Uploading files...</span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Error Modal */}
      {error && error.includes('upload') && (
        <UploadError
          error={error}
          onRetry={() => setError(null)}
        />
      )}
    </div>
  );
};

export default Documents;