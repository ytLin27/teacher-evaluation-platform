import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, SearchBar } from '../components/ui';
import AddResearchForm from '../components/forms/AddResearchForm';
import { useToast } from '../contexts/ToastContext';

const Research = () => {
  // Navigation hook
  const navigate = useNavigate();

  // State for managing add form modal
  const [showAddForm, setShowAddForm] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Toast hook
  const { showSuccess, showError } = useToast();

  // Event handlers for buttons
  const handleExportReport = async () => {
    console.log('Export Report clicked');
    try {
      // 导出研究数据为CSV格式
      const response = await fetch('http://localhost:3001/api/exports/research/1?format=csv&type=all');

      if (response.ok) {
        // 创建下载链接
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

  const handleAddPublication = () => {
    console.log('Add Publication clicked');
    setShowAddForm(true);
  };

  const handleAddSuccess = (newItem) => {
    console.log('New research item added:', newItem);
    // Here you could refresh the data or update the local state
    // For now, we just close the modal (handled by the form)
  };

  const handleViewAllPublications = () => {
    console.log('View All Publications clicked');
    navigate('/research/publications');
  };

  const handleViewAllGrants = () => {
    console.log('View All Grants clicked');
    navigate('/research/grants');
  };

  // Mock research data
  const publications = [
    {
      id: 1,
      title: 'Machine Learning Approaches for Educational Data Mining',
      journal: 'IEEE Transactions on Learning Technologies',
      type: 'Journal Article',
      date: '2024-01-15',
      impact_factor: 3.52,
      citations: 15,
      status: 'Published'
    },
    {
      id: 2,
      title: 'Adaptive Learning Systems in Higher Education',
      journal: 'Computers & Education',
      type: 'Journal Article',
      date: '2023-09-20',
      impact_factor: 5.627,
      citations: 28,
      status: 'Published'
    },
    {
      id: 3,
      title: 'AI-Powered Assessment Tools for Online Learning',
      journal: 'Educational Technology Research',
      type: 'Conference Paper',
      date: '2023-06-10',
      impact_factor: 2.3,
      citations: 8,
      status: 'Published'
    },
    {
      id: 4,
      title: 'Blockchain Applications in Academic Credentialing',
      journal: 'Journal of Educational Technology & Society',
      type: 'Journal Article',
      date: '2024-03-01',
      impact_factor: 3.1,
      citations: 3,
      status: 'Under Review'
    }
  ];

  const grants = [
    {
      id: 1,
      title: 'NSF: Intelligent Tutoring Systems for STEM Education',
      agency: 'National Science Foundation',
      amount: 250000,
      status: 'Active',
      start_date: '2023-09-01',
      end_date: '2026-08-31',
      role: 'Principal Investigator'
    },
    {
      id: 2,
      title: 'DOE: Machine Learning for Educational Analytics',
      agency: 'Department of Education',
      amount: 150000,
      status: 'Active',
      start_date: '2024-01-01',
      end_date: '2025-12-31',
      role: 'Co-Principal Investigator'
    },
    {
      id: 3,
      title: 'University Research Grant: Adaptive Learning Platforms',
      agency: 'University Internal Grant',
      amount: 25000,
      status: 'Completed',
      start_date: '2022-09-01',
      end_date: '2023-08-31',
      role: 'Principal Investigator'
    }
  ];

  const researchMetrics = {
    totalPublications: 23,
    totalCitations: 342,
    hIndex: 12,
    totalFunding: 425000,
    activeGrants: 2
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'published': return 'success';
      case 'under review': return 'warning';
      case 'active': return 'primary';
      case 'completed': return 'secondary';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Research Portfolio
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Publications, grants, and research impact metrics
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            Export Report
          </Button>
          <Button variant="primary" size="sm" onClick={handleAddPublication}>
            Add Publication
          </Button>
        </div>
      </div>

      {/* Research Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{researchMetrics.totalPublications}</div>
            <div className="text-sm text-gray-500 mt-1">Publications</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{researchMetrics.totalCitations}</div>
            <div className="text-sm text-gray-500 mt-1">Citations</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{researchMetrics.hIndex}</div>
            <div className="text-sm text-gray-500 mt-1">H-Index</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(researchMetrics.totalFunding)}</div>
            <div className="text-sm text-gray-500 mt-1">Total Funding</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{researchMetrics.activeGrants}</div>
            <div className="text-sm text-gray-500 mt-1">Active Grants</div>
          </div>
        </Card>
      </div>

      {/* Publications */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>Recent Publications</Card.Title>
            <Button variant="ghost" size="sm" onClick={handleViewAllPublications}>
              View All
            </Button>
          </div>
        </Card.Header>
        <Card.Content className="p-0">
          <Table>
            <Table.Head>
              <tr>
                <Table.Header>Title & Journal</Table.Header>
                <Table.Header>Type</Table.Header>
                <Table.Header>Impact Factor</Table.Header>
                <Table.Header>Citations</Table.Header>
                <Table.Header>Status</Table.Header>
                <Table.Header>Date</Table.Header>
              </tr>
            </Table.Head>
            <Table.Body>
              {publications.map((pub, index) => (
                <Table.Row key={pub.id} index={index}>
                  <Table.Cell>
                    <div>
                      <div className="font-medium text-gray-900 text-sm leading-tight">{pub.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{pub.journal}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="secondary" size="sm">
                      {pub.type}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm font-medium text-gray-900">{pub.impact_factor}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-900">{pub.citations}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={getStatusColor(pub.status)} size="sm">
                      {pub.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-500">{formatDate(pub.date)}</span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>

      {/* Grants */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>Research Grants</Card.Title>
            <Button variant="ghost" size="sm" onClick={handleViewAllGrants}>
              View All
            </Button>
          </div>
        </Card.Header>
        <Card.Content className="p-0">
          <Table>
            <Table.Head>
              <tr>
                <Table.Header>Grant Title</Table.Header>
                <Table.Header>Agency</Table.Header>
                <Table.Header>Amount</Table.Header>
                <Table.Header>Role</Table.Header>
                <Table.Header>Period</Table.Header>
                <Table.Header>Status</Table.Header>
              </tr>
            </Table.Head>
            <Table.Body>
              {grants.map((grant, index) => (
                <Table.Row key={grant.id} index={index}>
                  <Table.Cell>
                    <div className="font-medium text-gray-900 text-sm">{grant.title}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-900">{grant.agency}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(grant.amount)}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-900">{grant.role}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm text-gray-900">
                      {formatDate(grant.start_date)} - {formatDate(grant.end_date)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={getStatusColor(grant.status)} size="sm">
                      {grant.status}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>

      {/* Research Areas and Collaborations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Research Areas</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-900">Machine Learning in Education</span>
                <Badge variant="primary" size="sm">8 papers</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <span className="text-sm font-medium text-indigo-900">Educational Data Mining</span>
                <Badge variant="secondary" size="sm">6 papers</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">Adaptive Learning Systems</span>
                <Badge variant="info" size="sm">5 papers</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">AI in Assessment</span>
                <Badge variant="success" size="sm">4 papers</Badge>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Key Collaborations</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">MIT</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">MIT Computer Science</div>
                  <div className="text-xs text-gray-500">3 joint publications, 2 ongoing projects</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">IBM</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">IBM Research</div>
                  <div className="text-xs text-gray-500">Industry partnership, AI education tools</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">NSF</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">NSF Consortium</div>
                  <div className="text-xs text-gray-500">Multi-institution research initiative</div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Add Research Form Modal */}
      <AddResearchForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default Research;