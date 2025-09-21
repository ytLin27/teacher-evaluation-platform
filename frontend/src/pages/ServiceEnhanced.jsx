import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card, Table, Badge, Button, Select, DateRangePicker,
  SortableTableHeader, Pagination, EmptyState, ErrorState
} from '../components/ui';
import AddServiceForm from '../components/forms/AddServiceForm';
import { useToast } from '../contexts/ToastContext';

const ServiceEnhanced = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const { showSuccess, showError } = useToast();

  // 数据状态
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0
  });

  // URL参数状态
  const page = parseInt(searchParams.get('page')) || 1;
  const size = parseInt(searchParams.get('size')) || 10;
  const type = searchParams.get('type') || '';
  const role = searchParams.get('role') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const sortBy = searchParams.get('sort') || 'start_date';
  const sortOrder = searchParams.get('order') || 'desc';

  // 默认时间范围（近一年）
  const defaultStartDate = from || new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
  const defaultEndDate = to || new Date().toISOString().split('T')[0];

  // 获取服务数据
  useEffect(() => {
    fetchServiceData();
  }, [page, size, type, role, from, to, sortBy, sortOrder]);

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        teacherId: '1',
        page: page.toString(),
        size: size.toString(),
        ...(type && { type }),
        ...(role && { role }),
        from: from || defaultStartDate,
        to: to || defaultEndDate,
        sortBy,
        sortOrder
      });

      const response = await fetch(`http://localhost:3001/api/services?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setServiceData(data.items || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching service data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // URL参数更新函数
  const updateParams = (newParams) => {
    const updatedParams = new URLSearchParams(searchParams);
    Object.keys(newParams).forEach(key => {
      if (newParams[key]) {
        updatedParams.set(key, newParams[key]);
      } else {
        updatedParams.delete(key);
      }
    });
    updatedParams.set('page', '1'); // 重置到第一页
    setSearchParams(updatedParams);
  };

  // 事件处理函数
  const handleTypeFilter = (value) => {
    updateParams({ type: value });
  };

  const handleRoleFilter = (value) => {
    updateParams({ role: value });
  };

  const handleDateRangeChange = (startDate, endDate) => {
    updateParams({ from: startDate, to: endDate });
  };

  const handleSort = (column, order) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', column);
    newParams.set('order', order);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleAddService = () => {
    setShowAddForm(true);
  };

  const handleAddSuccess = (newItem) => {
    fetchServiceData(); // 重新获取数据
  };

  const handleViewAllServices = () => {
    navigate('/service/records');
  };

  const handleRetry = () => {
    fetchServiceData();
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/exports/service/1?format=csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `service_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showSuccess('Service report exported successfully!');
      } else {
        showError('Failed to export service report. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed due to network error. Please check your connection.');
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'committee':
        return 'default';
      case 'review':
        return 'secondary';
      case 'community':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  // 计算服务统计
  const serviceMetrics = {
    activeCommitments: serviceData.filter(s => !s.end_date || new Date(s.end_date) > new Date()).length,
    completedProjects: serviceData.filter(s => s.end_date && new Date(s.end_date) <= new Date()).length,
    totalHours: serviceData.reduce((sum, s) => sum + (s.workload_hours || 0), 0),
    totalServices: serviceData.length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-72 animate-pulse"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Portfolio</h1>
            <p className="text-gray-600 mt-1">Manage your service contributions</p>
          </div>
        </div>
        <ErrorState
          title="Failed to load service data"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Portfolio</h1>
          <p className="text-gray-600 mt-1">
            Track your service contributions and commitments ({pagination.total} total)
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={handleExportReport}>
            Export Report
          </Button>
          <Button onClick={handleAddService}>
            Add Service
          </Button>
        </div>
      </div>

      {/* Service Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{serviceMetrics.totalServices}</div>
            <div className="text-sm text-gray-500 mt-1">Total Services</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{serviceMetrics.activeCommitments}</div>
            <div className="text-sm text-gray-500 mt-1">Active Commitments</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{serviceMetrics.completedProjects}</div>
            <div className="text-sm text-gray-500 mt-1">Completed Projects</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{serviceMetrics.totalHours}h</div>
            <div className="text-sm text-gray-500 mt-1">Total Hours</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          value={type}
          onChange={(e) => handleTypeFilter(e.target.value)}
          placeholder="All Types"
        >
          <option value="">All Types</option>
          <option value="committee">Committee</option>
          <option value="review">Review</option>
          <option value="community">Community</option>
        </Select>
        <Select
          value={role}
          onChange={(e) => handleRoleFilter(e.target.value)}
          placeholder="All Roles"
        >
          <option value="">All Roles</option>
          <option value="Chair">Chair</option>
          <option value="Member">Member</option>
          <option value="Reviewer">Reviewer</option>
          <option value="Organizer">Organizer</option>
          <option value="Mentor">Mentor</option>
        </Select>
        <DateRangePicker
          startDate={from || defaultStartDate}
          endDate={to || defaultEndDate}
          onStartDateChange={(date) => handleDateRangeChange(date, to || defaultEndDate)}
          onEndDateChange={(date) => handleDateRangeChange(from || defaultStartDate, date)}
          label="Service Period"
        />
      </div>

      {/* Service Data Table */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>
              Service Records (Page {pagination.page} of {pagination.totalPages})
            </Card.Title>
            <Button variant="ghost" size="sm" onClick={handleViewAllServices}>
              View All
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          {serviceData.length === 0 ? (
            <EmptyState
              title="No service records found"
              message={type || role || from || to ? "Try adjusting your filters" : "No service contributions available for the selected period"}
              action={type || role || (from && from !== defaultStartDate) || (to && to !== defaultEndDate) ? {
                label: "Clear filters",
                onClick: () => setSearchParams({})
              } : undefined}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableTableHeader
                        sortKey="title"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Title & Role
                      </SortableTableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <SortableTableHeader
                        sortKey="start_date"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Period
                      </SortableTableHeader>
                      <SortableTableHeader
                        sortKey="workload_hours"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Workload
                      </SortableTableHeader>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {serviceData.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 max-w-md truncate" title={service.title}>
                              {service.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              Role: {service.role || 'N/A'}
                            </div>
                            {service.description && (
                              <div className="text-xs text-gray-400 mt-1 max-w-md truncate" title={service.description}>
                                {service.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getTypeColor(service.type)} size="sm">
                            {service.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.organization || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            {formatDate(service.start_date)} - {service.end_date ? formatDate(service.end_date) : 'Present'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.workload_hours ? `${service.workload_hours} hours` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    showInfo={true}
                    totalItems={pagination.total}
                  />
                </div>
              )}
            </>
          )}
        </Card.Content>
      </Card>

      {/* Add Service Form Modal */}
      <AddServiceForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default ServiceEnhanced;