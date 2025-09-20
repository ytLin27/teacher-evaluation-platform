import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Input, Select, SearchBar, Pagination } from '../components/ui';
import { EmptyReports, EmptySearch, LoadingError } from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  });

  const { showSuccess, showError } = useToast();

  // API base URL
  const API_BASE = 'http://localhost:3001/api';
  const TEACHER_ID = 1; // Default teacher ID for demo

  // Mock reports data (expanded for pagination demo)
  const mockReportsData = [
    {
      id: 1,
      name: 'Complete Teaching Report 2024',
      scope: 'teaching',
      format: 'PDF',
      status: 'completed',
      created_at: '2024-01-15T10:30:00Z',
      completed_at: '2024-01-15T10:32:45Z',
      file_size: '2.3 MB',
      download_count: 5
    },
    {
      id: 2,
      name: 'Research Portfolio Summary',
      scope: 'research',
      format: 'CSV',
      status: 'completed',
      created_at: '2024-01-14T14:20:00Z',
      completed_at: '2024-01-14T14:21:30Z',
      file_size: '485 KB',
      download_count: 2
    },
    {
      id: 3,
      name: 'Service Contributions Report',
      scope: 'service',
      format: 'PDF',
      status: 'generating',
      created_at: '2024-01-16T09:15:00Z',
      progress: 65
    },
    {
      id: 4,
      name: 'Annual Performance Overview',
      scope: 'overview',
      format: 'PDF',
      status: 'failed',
      created_at: '2024-01-13T16:45:00Z',
      error_message: 'Insufficient data for report generation'
    },
    {
      id: 5,
      name: 'Professional Development Log',
      scope: 'professional',
      format: 'CSV',
      status: 'completed',
      created_at: '2024-01-12T11:00:00Z',
      completed_at: '2024-01-12T11:01:15Z',
      file_size: '156 KB',
      download_count: 8
    },
    {
      id: 6,
      name: 'Q1 Teaching Assessment',
      scope: 'teaching',
      format: 'PDF',
      status: 'completed',
      created_at: '2024-01-10T08:15:00Z',
      completed_at: '2024-01-10T08:17:23Z',
      file_size: '1.2 MB',
      download_count: 3
    },
    {
      id: 7,
      name: 'Grant Applications Summary',
      scope: 'research',
      format: 'Excel',
      status: 'completed',
      created_at: '2024-01-08T15:45:00Z',
      completed_at: '2024-01-08T15:46:12Z',
      file_size: '890 KB',
      download_count: 1
    },
    {
      id: 8,
      name: 'Committee Work Report',
      scope: 'service',
      format: 'PDF',
      status: 'completed',
      created_at: '2024-01-05T11:30:00Z',
      completed_at: '2024-01-05T11:32:45Z',
      file_size: '645 KB',
      download_count: 4
    }
  ];

  // Fetch reports from API (mock implementation with pagination)
  const fetchReports = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter data based on search and status
      let filteredData = mockReportsData.filter(report => {
        const matchesSearch = !search ||
          report.name.toLowerCase().includes(search.toLowerCase()) ||
          report.scope.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'all' || report.status === status;
        return matchesSearch && matchesStatus;
      });

      // Implement pagination
      const itemsPerPage = pagination.per_page;
      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setReports(paginatedData);
      setPagination({
        current_page: page,
        per_page: itemsPerPage,
        total: totalItems,
        total_pages: totalPages
      });
    } catch (err) {
      setError(err.message);
      showError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchReports(page, searchTerm, filterStatus);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReports(1, searchTerm, filterStatus);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'generating': return 'warning';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'generating':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleGenerateReport = async (reportData) => {
    setGenerating(true);
    try {
      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 2000));

      showSuccess('Report generation started successfully!');
      setShowGenerateModal(false);

      // Refresh the reports list to show the new report
      await fetchReports(1, searchTerm, filterStatus);
    } catch (error) {
      showError('Failed to start report generation');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report) => {
    if (report.status !== 'completed') return;

    // Simulate download
    const link = document.createElement('a');
    link.href = `#download-${report.id}`;
    link.download = `${report.name}.${report.format.toLowerCase()}`;
    showSuccess(`Downloading ${report.name}...`);

    // Update download count
    setReports(prev => prev.map(r =>
      r.id === report.id
        ? { ...r, download_count: (r.download_count || 0) + 1 }
        : r
    ));
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      // In production, this would be a real API call:
      // await fetch(`${API_BASE}/reports/${reportId}`, { method: 'DELETE' });

      showSuccess('Report deleted successfully');

      // Refresh the reports list
      await fetchReports(pagination.current_page, searchTerm, filterStatus);
    } catch (error) {
      showError('Failed to delete report');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
            Report Center
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Generate, manage, and download performance reports
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            variant="primary"
            onClick={() => setShowGenerateModal(true)}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <Card.Content className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search reports..."
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'generating', label: 'Generating' },
                  { value: 'failed', label: 'Failed' }
                ]}
              />
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Reports List */}
      <Card>
        <Card.Header>
          <Card.Title>Generated Reports ({pagination.total})</Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          {error ? (
            <LoadingError
              error={error}
              onRetry={() => fetchReports(pagination.current_page, searchTerm, filterStatus)}
            />
          ) : reports.length === 0 && !loading ? (
            searchTerm || filterStatus !== 'all' ? (
              <EmptySearch
                searchTerm={searchTerm}
                onClear={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              />
            ) : (
              <EmptyReports onGenerate={() => setShowGenerateModal(true)} />
            )
          ) : reports.length === 0 ? (
            <EmptyReports onGenerate={() => setShowGenerateModal(true)} />
          ) : (
            <Table>
              <Table.Head>
                <tr>
                  <Table.Header>Report Name</Table.Header>
                  <Table.Header>Scope</Table.Header>
                  <Table.Header>Format</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Created</Table.Header>
                  <Table.Header>Size</Table.Header>
                  <Table.Header>Downloads</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </tr>
              </Table.Head>
              <Table.Body>
                {reports.map((report, index) => (
                  <Table.Row key={report.id} index={index}>
                    <Table.Cell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {getStatusIcon(report.status)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{report.name}</div>
                          {report.status === 'failed' && report.error_message && (
                            <div className="text-xs text-red-600 mt-1">{report.error_message}</div>
                          )}
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="secondary" size="sm">
                        {report.scope}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-900">{report.format}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center">
                        <Badge variant={getStatusColor(report.status)} size="sm">
                          {report.status}
                        </Badge>
                        {report.status === 'generating' && report.progress && (
                          <div className="ml-2 text-xs text-gray-500">
                            {report.progress}%
                          </div>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-500">
                        {formatDate(report.created_at)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-900">
                        {report.file_size || '-'}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-900">
                        {report.download_count || 0}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        {report.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(report)}
                          >
                            Download
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(report.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card.Content>
      </Card>

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

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerateReport}
        loading={generating}
      />
    </div>
  );
};

// Generate Report Modal Component
const GenerateReportModal = ({ isOpen, onClose, onGenerate, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    scope: 'overview',
    format: 'PDF',
    includeCharts: true,
    dateRange: 'current_year'
  });

  const scopeOptions = [
    { value: 'overview', label: 'Performance Overview' },
    { value: 'teaching', label: 'Teaching Performance' },
    { value: 'research', label: 'Research Portfolio' },
    { value: 'service', label: 'Service Contributions' },
    { value: 'professional', label: 'Professional Development' },
    { value: 'career', label: 'Career History' }
  ];

  const formatOptions = [
    { value: 'PDF', label: 'PDF Document' },
    { value: 'CSV', label: 'CSV Spreadsheet' },
    { value: 'JSON', label: 'JSON Data' }
  ];

  const dateRangeOptions = [
    { value: 'current_year', label: 'Current Year' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'last_2_years', label: 'Last 2 Years' },
    { value: 'all_time', label: 'All Time' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const generateDefaultName = () => {
    const scopeLabel = scopeOptions.find(opt => opt.value === formData.scope)?.label || 'Report';
    const year = new Date().getFullYear();
    return `${scopeLabel} ${year}`;
  };

  useEffect(() => {
    if (isOpen && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: generateDefaultName()
      }));
    }
  }, [isOpen, formData.scope]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate New Report">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Name
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter report name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Scope
          </label>
          <Select
            value={formData.scope}
            onChange={(value) => setFormData(prev => ({
              ...prev,
              scope: value,
              name: generateDefaultName()
            }))}
            options={scopeOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Format
          </label>
          <Select
            value={formData.format}
            onChange={(value) => setFormData(prev => ({ ...prev, format: value }))}
            options={formatOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <Select
            value={formData.dateRange}
            onChange={(value) => setFormData(prev => ({ ...prev, dateRange: value }))}
            options={dateRangeOptions}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeCharts"
            checked={formData.includeCharts}
            onChange={(e) => setFormData(prev => ({ ...prev, includeCharts: e.target.checked }))}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="includeCharts" className="ml-2 block text-sm text-gray-900">
            Include charts and visualizations
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading || !formData.name.trim()}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Reports;