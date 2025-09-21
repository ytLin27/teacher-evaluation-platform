import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Table, Badge, Button, SearchBar, Pagination, EmptyState, ErrorState } from '../components/ui';

const AllGrants = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0
  });

  // URL参数
  const page = parseInt(searchParams.get('page')) || 1;
  const size = parseInt(searchParams.get('size')) || 10;
  const q = searchParams.get('q') || '';
  const status = searchParams.get('status') || '';

  useEffect(() => {
    fetchGrants();
  }, [page, size, q, status]);

  const fetchGrants = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        teacherId: '1',
        page: page.toString(),
        size: size.toString(),
        ...(q && { q }),
        ...(status && { status }),
        sortBy: 'date',
        sortOrder: 'desc'
      });

      const response = await fetch(`http://localhost:3001/api/publications/grants?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGrants(data.items || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching grants:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/research');
  };

  const handleSearch = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('q', value);
    } else {
      newParams.delete('q');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleRetry = () => {
    fetchGrants();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
            <h2 className="text-2xl font-bold text-gray-900">All Grants</h2>
            <p className="text-gray-600 mt-1">Complete list of research grants and funding</p>
          </div>
          <Button variant="outline" onClick={handleBack}>
            ← Back to Research
          </Button>
        </div>
        <ErrorState
          title="Failed to load grants"
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
          <h2 className="text-2xl font-bold text-gray-900">All Grants</h2>
          <p className="text-gray-600 mt-1">Complete list of research grants and funding</p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          ← Back to Research
        </Button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md">
        <SearchBar
          placeholder="Search grants by title, agency, status, or year..."
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <Card>
        <Card.Header>
          <Card.Title>
            Research Grants (Page {pagination.page} of {pagination.totalPages})
          </Card.Title>
        </Card.Header>
        <Card.Content>
          {grants.length === 0 ? (
            <EmptyState
              title="No grants found"
              message={q ? "Try adjusting your search" : "No research grants available"}
              action={q ? {
                label: "Clear search",
                onClick: () => setSearchParams({})
              } : undefined}
            />
          ) : (
            <>
              <div className="overflow-x-auto max-w-full">
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Header className="w-80 min-w-[320px]" sortable={true}>Project Title & Role</Table.Header>
                    <Table.Header className="w-48 min-w-[192px]">Agency</Table.Header>
                    <Table.Header className="w-32 min-w-[128px] text-right" sortable={true}>Amount</Table.Header>
                    <Table.Header className="w-40 min-w-[160px]">Period</Table.Header>
                    <Table.Header className="w-28 min-w-[112px]" sortable={true}>Status</Table.Header>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                {grants.map((grant, index) => (
                  <Table.Row key={grant.id || index}>
                    <Table.Cell className="font-medium w-80">
                      <div className="max-w-[300px]">
                        <div className="truncate font-semibold" title={grant.title}>
                          {grant.title}
                        </div>
                        {grant.role && (
                          <div className="mt-1">
                            <Badge
                              variant={grant.role === 'PI' ? 'default' : 'secondary'}
                              size="sm"
                            >
                              {grant.role}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell className="w-48 max-w-[192px] truncate" title={grant.agency}>
                      {grant.agency || 'N/A'}
                    </Table.Cell>
                    <Table.Cell className="w-32 text-right font-medium text-green-700">
                      {grant.amount ? formatCurrency(grant.amount) : 'N/A'}
                    </Table.Cell>
                    <Table.Cell className="w-40">
                      <div className="text-sm">
                        {grant.start_year && grant.end_year
                          ? `${grant.start_year} - ${grant.end_year}`
                          : 'N/A'
                        }
                      </div>
                    </Table.Cell>
                    <Table.Cell className="w-28">
                      <Badge
                        variant={grant.status === 'Active' ? 'default' :
                                grant.status === 'Completed' ? 'secondary' : 'outline'}
                      >
                        {grant.status || 'Unknown'}
                      </Badge>
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

export default AllGrants;