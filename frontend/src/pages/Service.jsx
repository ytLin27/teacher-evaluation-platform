import React from 'react';
import { Card, Table, Badge, Button } from '../components/ui';

const Service = () => {
  // Mock service data
  const serviceCommitments = [
    {
      id: 1,
      title: 'Department Curriculum Committee',
      type: 'Internal Committee',
      role: 'Chair',
      start_date: '2023-09-01',
      end_date: '2024-08-31',
      workload_hours: 45,
      status: 'Active',
      description: 'Leading curriculum review and development initiatives'
    },
    {
      id: 2,
      title: 'IEEE Computer Society',
      type: 'Professional Organization',
      role: 'Editorial Board Member',
      start_date: '2022-01-01',
      end_date: null,
      workload_hours: 30,
      status: 'Active',
      description: 'Reviewing papers for IEEE Transactions on Learning Technologies'
    },
    {
      id: 3,
      title: 'NSF Review Panel',
      type: 'External Review',
      role: 'Reviewer',
      start_date: '2024-02-15',
      end_date: '2024-03-15',
      workload_hours: 12,
      status: 'Completed',
      description: 'Reviewing grant proposals for computer science education'
    },
    {
      id: 4,
      title: 'University Senate Technology Committee',
      type: 'University Committee',
      role: 'Member',
      start_date: '2023-01-01',
      end_date: '2024-12-31',
      workload_hours: 25,
      status: 'Active',
      description: 'Advising on university-wide technology initiatives'
    }
  ];

  const communityService = [
    {
      id: 1,
      title: 'Code.org Volunteer',
      organization: 'Code.org',
      type: 'Educational Outreach',
      date: '2024-01-20',
      hours: 8,
      description: 'Teaching coding fundamentals to K-12 students'
    },
    {
      id: 2,
      title: 'Women in Tech Mentorship Program',
      organization: 'Local Tech Alliance',
      type: 'Mentoring',
      date: '2023-11-15',
      hours: 12,
      description: 'Mentoring early-career professionals in technology'
    },
    {
      id: 3,
      title: 'Science Fair Judge',
      organization: 'Regional Science Fair',
      type: 'Judging',
      date: '2024-03-10',
      hours: 6,
      description: 'Evaluating student projects in computer science category'
    }
  ];

  const serviceMetrics = {
    totalHours: 138,
    activeCommitments: 3,
    completedProjects: 8,
    mentees: 12
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'completed': return 'secondary';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'internal committee': return 'primary';
      case 'university committee': return 'secondary';
      case 'professional organization': return 'info';
      case 'external review': return 'warning';
      case 'educational outreach': return 'success';
      case 'mentoring': return 'primary';
      case 'judging': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Ongoing';
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
            Service Portfolio
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Committee work, professional service, and community engagement
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button variant="primary" size="sm">
            Add Service
          </Button>
        </div>
      </div>

      {/* Service Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{serviceMetrics.totalHours}</div>
            <div className="text-sm text-gray-500 mt-1">Total Hours</div>
            <div className="text-xs text-gray-400 mt-1">Current Year</div>
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
            <div className="text-2xl font-bold text-green-600">{serviceMetrics.mentees}</div>
            <div className="text-sm text-gray-500 mt-1">Current Mentees</div>
          </div>
        </Card>
      </div>

      {/* Service Commitments */}
      <Card>
        <Card.Header>
          <Card.Title>Professional Service Commitments</Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          <Table>
            <Table.Head>
              <tr>
                <Table.Header>Title & Role</Table.Header>
                <Table.Header>Type</Table.Header>
                <Table.Header>Period</Table.Header>
                <Table.Header>Hours</Table.Header>
                <Table.Header>Status</Table.Header>
              </tr>
            </Table.Head>
            <Table.Body>
              {serviceCommitments.map((service, index) => (
                <Table.Row key={service.id} index={index}>
                  <Table.Cell>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{service.title}</div>
                      <div className="text-sm text-gray-500 mt-1">Role: {service.role}</div>
                      <div className="text-xs text-gray-400 mt-1">{service.description}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={getTypeColor(service.type)} size="sm">
                      {service.type}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm text-gray-900">
                      {formatDate(service.start_date)} - {formatDate(service.end_date)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm font-medium text-gray-900">{service.workload_hours}h</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={getStatusColor(service.status)} size="sm">
                      {service.status}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>

      {/* Community Service and Outreach */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Community Service & Outreach</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {communityService.map((activity) => (
                <div key={activity.id} className="border-l-4 border-purple-400 pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{activity.organization}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <Badge variant={getTypeColor(activity.type)} size="sm">
                        {activity.type}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">{activity.hours}h</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{formatDate(activity.date)}</div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Service Impact</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-900">Leadership Roles</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Currently serving as chair of 1 committee and member of 3 others
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900">Review Activities</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Reviewed 15 papers for journals and 8 grant proposals this year
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-900">Mentoring</h4>
                <p className="text-sm text-green-700 mt-1">
                  Actively mentoring 12 students and early-career professionals
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-900">Outreach</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Participated in 6 outreach events reaching 200+ students
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Service Timeline */}
      <Card>
        <Card.Header>
          <Card.Title>Service Timeline</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flow-root">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900">Started as Chair of Department Curriculum Committee</p>
                        <p className="text-xs text-gray-500 mt-1">Leading major curriculum reform initiative</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        Sep 2023
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900">Completed NSF Review Panel Service</p>
                        <p className="text-xs text-gray-500 mt-1">Reviewed 12 grant proposals in computer science education</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        Mar 2024
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <li>
                <div className="relative">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900">Joined IEEE Editorial Board</p>
                        <p className="text-xs text-gray-500 mt-1">Editorial board member for IEEE Transactions on Learning Technologies</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        Jan 2022
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Service;