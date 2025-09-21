import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card, Table, Badge, Button, SearchBar, Select, DateRangePicker,
  SortableTableHeader, Pagination, EmptyState, ErrorState
} from '../components/ui';
import AddResearchForm from '../components/forms/AddResearchForm';
import { useToast } from '../contexts/ToastContext';

const ResearchEnhanced = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const { showSuccess, showError } = useToast();

  // 数据状态
  const [researchData, setResearchData] = useState([]);
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
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const status = searchParams.get('status') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const sortBy = searchParams.get('sort') || 'date';
  const sortOrder = searchParams.get('order') || 'desc';

  // 获取研究数据
  useEffect(() => {
    fetchResearchData();
  }, [page, size, q, type, status, from, to, sortBy, sortOrder]);

  const fetchResearchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(q && { q }),
        ...(type && { type }),
        ...(status && { status }),
        ...(from && { from }),
        ...(to && { to }),
        sortBy,
        sortOrder
      });

      const response = await fetch(`http://localhost:3001/api/teachers/1/research-data?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResearchData(data.items || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching research data:', error);
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
  const handleSearch = (value) => {
    updateParams({ q: value });
  };

  const handleTypeFilter = (value) => {
    updateParams({ type: value });
  };

  const handleStatusFilter = (value) => {
    updateParams({ status: value });
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

  const handleAddPublication = () => {
    setShowAddForm(true);
  };

  const handleAddSuccess = (newItem) => {
    fetchResearchData(); // 重新获取数据
  };

  const handleRetry = () => {
    fetchResearchData();
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/exports/research/1?format=csv&type=all');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `research_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showSuccess('Research report exported successfully!');
      } else {
        showError('Failed to export research report. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed due to network error. Please check your connection.');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
      case 'active':
        return 'default';
      case 'under review':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
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
            <h1 className="text-3xl font-bold text-gray-900">Research Portfolio</h1>
            <p className="text-gray-600 mt-1">Manage your research publications and grants</p>
          </div>
        </div>
        <ErrorState
          title="Failed to load research data"
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
          <h1 className="text-3xl font-bold text-gray-900">Research Portfolio</h1>
          <p className="text-gray-600 mt-1">
            Manage your research publications and grants ({pagination.total} total)
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={handleExportReport}>
            Export Report
          </Button>
          <Button onClick={handleAddPublication}>
            Add Publication
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <SearchBar
            placeholder="Search by title, journal, or keywords..."
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select
          value={type}
          onChange={(e) => handleTypeFilter(e.target.value)}
          placeholder="All Types"
        >
          <option value="">All Types</option>
          <option value="publication">Publications</option>
          <option value="grant">Grants</option>
        </Select>
        <Select
          value={status}
          onChange={(e) => handleStatusFilter(e.target.value)}
          placeholder="All Status"
        >
          <option value="">All Status</option>
          <option value="Published">Published</option>
          <option value="Under Review">Under Review</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </Select>
        <DateRangePicker
          startDate={from}
          endDate={to}
          onStartDateChange={(date) => handleDateRangeChange(date, to)}
          onEndDateChange={(date) => handleDateRangeChange(from, date)}
          className="text-sm"
        />
      </div>

      {/* Research Data Table */}
      <Card>
        <Card.Header>
          <Card.Title>
            Research Items (Page {pagination.page} of {pagination.totalPages})
          </Card.Title>
        </Card.Header>
        <Card.Content>
          {researchData.length === 0 ? (
            <EmptyState
              title="No research data found"
              message={q || type || status || from || to ? "Try adjusting your search and filters" : "No research publications or grants available"}
              action={q || type || status || from || to ? {
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
                        Title & Details
                      </SortableTableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <SortableTableHeader
                        sortKey="date"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Date
                      </SortableTableHeader>
                      <SortableTableHeader
                        sortKey="citation_count"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Citations
                      </SortableTableHeader>
                      <SortableTableHeader
                        sortKey="impact_factor"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Impact/Amount
                      </SortableTableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {researchData.map((item) => (
                      <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 max-w-md truncate" title={item.title}>
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-500 max-w-md truncate">
                              {item.journal || item.agency || item.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" size="sm">
                            {item.displayType}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.citations || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.type === 'grant' ?
                            formatCurrency(item.amount) :
                            (item.impact_factor ? item.impact_factor.toFixed(1) : 'N/A')
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusColor(item.status)} size="sm">
                            {item.status || 'N/A'}
                          </Badge>
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

      {/* Add Research Form Modal */}
      <AddResearchForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default ResearchEnhanced;