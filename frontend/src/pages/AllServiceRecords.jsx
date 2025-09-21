import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Table, Badge, Button, SearchBar, Pagination, EmptyState, ErrorState } from '../components/ui';

const AllServiceRecords = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0
  });
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);

  // URL参数
  const page = parseInt(searchParams.get('page')) || 1;
  const size = parseInt(searchParams.get('size')) || 10;
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';

  // 初始化搜索输入框的值
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // 监听URL参数变化进行数据获取
  useEffect(() => {
    fetchServices();
  }, [page, size, q, type]);

  // 基于URL参数获取数据
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        teacherId: '1',
        page: page.toString(),
        size: size.toString(),
        ...(q && { q }),
        ...(type && { type }),
        sortBy: 'start_date',
        sortOrder: 'desc'
      });

      const response = await fetch(`http://localhost:3001/api/services?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setServices(data.items || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching service records:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleBack = () => {
    navigate('/service');
  };

  // 更新URL参数
  const updateURLParams = useCallback((searchValue) => {
    const newParams = new URLSearchParams(searchParams);
    if (searchValue.trim()) {
      newParams.set('q', searchValue.trim());
    } else {
      newParams.delete('q');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // 处理搜索输入变化（防抖）
  const handleSearchInputChange = (value) => {
    setSearchInput(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      updateURLParams(value);
    }, 700); // 0.7秒防抖延迟
  };

  // 处理 Enter 键或失焦立即搜索
  const handleSearchSubmit = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    updateURLParams(searchInput);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleRetry = () => {
    fetchServices();
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-72 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
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
            <h2 className="text-2xl font-bold text-gray-900">All Service Records</h2>
            <p className="text-gray-600 mt-1">Complete list of service contributions and commitments</p>
          </div>
          <Button variant="outline" onClick={handleBack}>
            ← Back to Service
          </Button>
        </div>
        <ErrorState
          title="Failed to load service records"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Service Records</h2>
          <p className="text-gray-600 mt-1">Complete list of service contributions and commitments</p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          ← Back to Service
        </Button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md">
        <SearchBar
          placeholder="Search service records by title, organization, or role..."
          value={searchInput}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit();
            }
          }}
          onBlur={handleSearchSubmit}
        />
      </div>

      <Card>
        <Card.Header>
          <Card.Title>
            Service Records (Page {pagination.page} of {pagination.totalPages})
          </Card.Title>
        </Card.Header>
        <Card.Content>
          {services.length === 0 ? (
            <EmptyState
              title="No service records found"
              description={q ? "Try adjusting your search terms or clear the search" : "No service contributions available"}
              actionText={q ? "Clear search" : undefined}
              onAction={q ? () => {
                setSearchInput('');
                updateURLParams('');
              } : undefined}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Head>
                    <Table.Row>
                      <Table.Header className="w-80 min-w-[320px]">Title & Role</Table.Header>
                      <Table.Header className="w-32 min-w-[128px]">Type</Table.Header>
                      <Table.Header className="w-48 min-w-[192px]">Organization</Table.Header>
                      <Table.Header className="w-40 min-w-[160px]">Period</Table.Header>
                      <Table.Header className="w-28 min-w-[112px]">Workload</Table.Header>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {services.map((service) => (
                      <Table.Row key={service.id}>
                        <Table.Cell className="w-80">
                          <div className="max-w-[300px]">
                            <div className="truncate font-semibold" title={service.title}>
                              {service.title}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Role: {service.role || 'N/A'}
                            </div>
                            {service.description && (
                              <div className="text-xs text-gray-400 mt-1 truncate" title={service.description}>
                                {service.description}
                              </div>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="w-32">
                          <Badge variant={getTypeColor(service.type)} size="sm">
                            {service.type}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="w-48 truncate" title={service.organization}>
                          {service.organization || 'N/A'}
                        </Table.Cell>
                        <Table.Cell className="w-40">
                          <div className="text-sm">
                            {formatDate(service.start_date)} - {service.end_date ? formatDate(service.end_date) : 'Present'}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="w-28">
                          {service.workload_hours ? `${service.workload_hours} hours` : 'N/A'}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
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
    </div>
  );
};

export default AllServiceRecords;