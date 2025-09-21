import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Table, Badge, Button, SearchBar, Pagination, EmptyState, ErrorState } from '../components/ui';

const AllPublications = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [publications, setPublications] = useState([]);
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
  const type = searchParams.get('type') || '';
  const year = searchParams.get('year') || '';

  useEffect(() => {
    fetchPublications();
  }, [page, size, q, type, year]);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        teacherId: '1',
        page: page.toString(),
        size: size.toString(),
        ...(q && { q }),
        ...(type && { type }),
        ...(year && { year }),
        sortBy: 'date',
        sortOrder: 'desc'
      });

      const response = await fetch(`http://localhost:3001/api/publications?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPublications(data.items || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching publications:', error);
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
    newParams.set('page', '1'); // 重置到第一页
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleRetry = () => {
    fetchPublications();
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
            <h2 className="text-2xl font-bold text-gray-900">All Publications</h2>
            <p className="text-gray-600 mt-1">Complete list of research publications</p>
          </div>
          <Button variant="outline" onClick={handleBack}>
            ← Back to Research
          </Button>
        </div>
        <ErrorState
          title="Failed to load publications"
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
          <h2 className="text-2xl font-bold text-gray-900">All Publications</h2>
          <p className="text-gray-600 mt-1">Complete list of research publications ({pagination.total} total)</p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          ← Back to Research
        </Button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md">
        <SearchBar
          placeholder="Search publications by title, journal, type, or year..."
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <Card>
        <Card.Header>
          <Card.Title>
            Publications (Page {pagination.page} of {pagination.totalPages})
          </Card.Title>
        </Card.Header>
        <Card.Content>
          {publications.length === 0 ? (
            <EmptyState
              title="No publications found"
              message={q ? "Try adjusting your search terms" : "No research publications available"}
              action={q ? {
                label: "Clear search",
                onClick: () => handleSearch('')
              } : undefined}
            />
          ) : (
            <>
              <div className="overflow-x-auto max-w-full">
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Header className="w-80 min-w-[320px]" sortable={true}>Title</Table.Header>
                    <Table.Header className="w-48 min-w-[192px]">Journal/Venue</Table.Header>
                    <Table.Header className="w-20 min-w-[80px]" sortable={true}>Year</Table.Header>
                    <Table.Header className="w-24 min-w-[96px] text-right" sortable={true}>Citations</Table.Header>
                    <Table.Header className="w-28 min-w-[112px] text-right">Impact Factor</Table.Header>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {publications.map((pub) => (
                    <Table.Row key={pub.id}>
                      <Table.Cell className="font-medium w-80">
                        <div className="max-w-[300px]">
                          <div className="truncate font-semibold" title={pub.title}>
                            {pub.title}
                          </div>
                          {pub.url && (
                            <a
                              href={pub.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                            >
                              View paper
                            </a>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="w-48 max-w-[192px] truncate" title={pub.journal || pub.description}>
                        {pub.journal || pub.description || 'N/A'}
                      </Table.Cell>
                      <Table.Cell className="w-20 text-center">{pub.year || 'N/A'}</Table.Cell>
                      <Table.Cell className="w-24 text-right font-medium">
                        {pub.citations || pub.citation_count || 0}
                      </Table.Cell>
                      <Table.Cell className="w-28 text-right">
                        <span className={pub.impact_factor && pub.impact_factor >= 3 ? 'text-green-600 font-medium' : ''}>
                          {pub.impact_factor ? pub.impact_factor.toFixed(1) : 'N/A'}
                        </span>
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

export default AllPublications;