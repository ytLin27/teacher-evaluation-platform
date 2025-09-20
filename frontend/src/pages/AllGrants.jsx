import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, SearchBar } from '../components/ui';

const AllGrants = () => {
  const navigate = useNavigate();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGrants, setFilteredGrants] = useState([]);

  useEffect(() => {
    fetchGrants();
  }, []);

  // Filter grants based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredGrants(grants);
    } else {
      const filtered = grants.filter(grant =>
        grant.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grant.agency?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grant.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grant.start_year?.toString().includes(searchTerm) ||
        grant.end_year?.toString().includes(searchTerm)
      );
      setFilteredGrants(filtered);
    }
  }, [grants, searchTerm]);

  const fetchGrants = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/teachers/1/research');
      if (response.ok) {
        const data = await response.json();
        setGrants(data.grants || []);
      } else {
        console.error('Failed to fetch grants');
      }
    } catch (error) {
      console.error('Error fetching grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/research');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading grants...</div>
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <Card.Header>
          <Card.Title>
            Research Grants ({filteredGrants.length}
            {searchTerm && ` of ${grants.length}`})
          </Card.Title>
        </Card.Header>
        <Card.Content>
          {filteredGrants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No grants found.
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Project Title</Table.Head>
                  <Table.Head>Agency</Table.Head>
                  <Table.Head>Amount</Table.Head>
                  <Table.Head>Period</Table.Head>
                  <Table.Head>Status</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredGrants.map((grant, index) => (
                  <Table.Row key={index}>
                    <Table.Cell className="font-medium">{grant.title}</Table.Cell>
                    <Table.Cell>{grant.agency}</Table.Cell>
                    <Table.Cell>{formatCurrency(grant.amount)}</Table.Cell>
                    <Table.Cell>{grant.start_year} - {grant.end_year}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant={grant.status === 'Active' ? 'default' :
                                grant.status === 'Completed' ? 'secondary' : 'outline'}
                      >
                        {grant.status}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default AllGrants;