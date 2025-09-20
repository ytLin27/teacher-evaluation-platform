import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, SearchBar } from '../components/ui';

const AllPublications = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPublications, setFilteredPublications] = useState([]);

  useEffect(() => {
    fetchPublications();
  }, []);

  // Filter publications based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPublications(publications);
    } else {
      const filtered = publications.filter(pub =>
        pub.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.journal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.year?.toString().includes(searchTerm)
      );
      setFilteredPublications(filtered);
    }
  }, [publications, searchTerm]);

  const fetchPublications = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/teachers/1/research');
      if (response.ok) {
        const data = await response.json();
        setPublications(data.publications || []);
      } else {
        console.error('Failed to fetch publications');
      }
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/research');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading publications...</div>
      </div>
    );
  }

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

      {/* Search Bar */}
      <div className="w-full max-w-md">
        <SearchBar
          placeholder="Search publications by title, journal, type, or year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <Card.Header>
          <Card.Title>
            Publications ({filteredPublications.length}
            {searchTerm && ` of ${publications.length}`})
          </Card.Title>
        </Card.Header>
        <Card.Content>
          {filteredPublications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No publications found.
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Title</Table.Head>
                  <Table.Head>Journal</Table.Head>
                  <Table.Head>Year</Table.Head>
                  <Table.Head>Type</Table.Head>
                  <Table.Head>Impact Factor</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredPublications.map((pub, index) => (
                  <Table.Row key={index}>
                    <Table.Cell className="font-medium">{pub.title}</Table.Cell>
                    <Table.Cell>{pub.journal}</Table.Cell>
                    <Table.Cell>{pub.year}</Table.Cell>
                    <Table.Cell>
                      <Badge variant="secondary">{pub.type}</Badge>
                    </Table.Cell>
                    <Table.Cell>{pub.impact_factor}</Table.Cell>
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

export default AllPublications;