import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Progress, LineChart, Button, Select, Input } from '../components/ui';

const Teaching = () => {
  const [teachingData, setTeachingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [termFilter, setTermFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Fetch teaching data from API
  useEffect(() => {
    const fetchTeachingData = async () => {
      try {
        // Fetch teacher evaluation data
        const response = await fetch('http://localhost:3001/api/teachers/1/evaluation');
        if (!response.ok) {
          throw new Error('Failed to fetch teaching data');
        }
        const data = await response.json();
        setTeachingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachingData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Extended mock data for courses (enhanced with real data when available)
  const allCourses = [
    {
      id: 1,
      course_code: 'CS 101',
      course_name: 'Introduction to Computer Science',
      semester: 'Fall',
      year: 2024,
      enrollment: 45,
      avg_rating: 4.6,
      evaluation_count: 42,
      status: 'Active'
    },
    {
      id: 2,
      course_code: 'CS 201',
      course_name: 'Data Structures and Algorithms',
      semester: 'Spring',
      year: 2024,
      enrollment: 38,
      avg_rating: 4.3,
      evaluation_count: 35,
      status: 'Completed'
    },
    {
      id: 3,
      course_code: 'CS 301',
      course_name: 'Database Systems',
      semester: 'Fall',
      year: 2023,
      enrollment: 32,
      avg_rating: 4.8,
      evaluation_count: 30,
      status: 'Completed'
    },
    {
      id: 4,
      course_code: 'CS 401',
      course_name: 'Software Engineering',
      semester: 'Spring',
      year: 2023,
      enrollment: 28,
      avg_rating: 4.4,
      evaluation_count: 26,
      status: 'Completed'
    },
    {
      id: 5,
      course_code: 'CS 150',
      course_name: 'Programming Fundamentals',
      semester: 'Fall',
      year: 2024,
      enrollment: 52,
      avg_rating: 4.2,
      evaluation_count: 48,
      status: 'Active'
    },
    {
      id: 6,
      course_code: 'CS 250',
      course_name: 'Computer Organization',
      semester: 'Spring',
      year: 2024,
      enrollment: 35,
      avg_rating: 4.7,
      evaluation_count: 33,
      status: 'Completed'
    },
    {
      id: 7,
      course_code: 'CS 350',
      course_name: 'Operating Systems',
      semester: 'Fall',
      year: 2023,
      enrollment: 30,
      avg_rating: 4.1,
      evaluation_count: 28,
      status: 'Completed'
    },
    {
      id: 8,
      course_code: 'CS 450',
      course_name: 'Machine Learning',
      semester: 'Spring',
      year: 2023,
      enrollment: 25,
      avg_rating: 4.9,
      evaluation_count: 24,
      status: 'Completed'
    },
    {
      id: 9,
      course_code: 'CS 360',
      course_name: 'Computer Networks',
      semester: 'Fall',
      year: 2022,
      enrollment: 40,
      avg_rating: 4.0,
      evaluation_count: 37,
      status: 'Completed'
    },
    {
      id: 10,
      course_code: 'CS 460',
      course_name: 'Web Development',
      semester: 'Spring',
      year: 2022,
      enrollment: 45,
      avg_rating: 4.5,
      evaluation_count: 42,
      status: 'Completed'
    },
    {
      id: 11,
      course_code: 'CS 480',
      course_name: 'Artificial Intelligence',
      semester: 'Fall',
      year: 2022,
      enrollment: 20,
      avg_rating: 4.3,
      evaluation_count: 19,
      status: 'Completed'
    },
    {
      id: 12,
      course_code: 'CS 490',
      course_name: 'Senior Capstone',
      semester: 'Spring',
      year: 2022,
      enrollment: 15,
      avg_rating: 4.8,
      evaluation_count: 15,
      status: 'Completed'
    }
  ];

  // Mock data for teaching metrics
  const teachingMetrics = {
    overall_rating: 4.5,
    teaching_quality: 4.6,
    course_content: 4.4,
    availability: 4.3,
    total_students: 143,
    response_rate: 87
  };

  // Enhanced trend data with more historical points for better visualization
  const trendData = [
    { period: '2022 Fall', rating: 3.8, evaluations: 25 },
    { period: '2023 Spring', rating: 4.2, evaluations: 27 },
    { period: '2023 Fall', rating: 4.5, evaluations: 28 },
    { period: '2024 Spring', rating: 4.3, evaluations: 32 },
    { period: '2024 Fall', rating: teachingData?.metrics?.teaching?.overall_rating || 4.6, evaluations: teachingData?.metrics?.teaching?.total_evaluations || 35 }
  ];

  // Prepare line chart data for student evaluation trends
  const lineChartData = {
    labels: trendData.map(trend => trend.period),
    datasets: [
      {
        label: 'Student Evaluation Rating',
        data: trendData.map(trend => trend.rating),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 4.0) return 'primary';
    if (rating >= 3.5) return 'warning';
    return 'danger';
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    return 'Needs Improvement';
  };

  // Filter and sort courses
  const getFilteredAndSortedCourses = () => {
    let filtered = allCourses.filter(course => {
      const matchesSearch =
        course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${course.semester} ${course.year}`.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTerm = termFilter === 'all' ||
        `${course.semester} ${course.year}` === termFilter;

      const matchesScore = course.avg_rating >= scoreFilter;

      return matchesSearch && matchesTerm && matchesScore;
    });

    // Sort courses
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'course':
          aValue = a.course_code;
          bValue = b.course_code;
          break;
        case 'term':
          aValue = `${a.year}-${a.semester}`;
          bValue = `${b.year}-${b.semester}`;
          break;
        case 'enrollment':
          aValue = a.enrollment;
          bValue = b.enrollment;
          break;
        case 'rating':
          aValue = a.avg_rating;
          bValue = b.avg_rating;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.avg_rating;
          bValue = b.avg_rating;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  };

  const filteredCourses = getFilteredAndSortedCourses();
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = showAllCourses
    ? filteredCourses
    : filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleTermFilterChange = (value) => {
    setTermFilter(value);
    setCurrentPage(1);
  };

  const handleScoreFilterChange = (value) => {
    setScoreFilter(Number(value));
    setCurrentPage(1);
  };

  // Handle export
  const handleExportPDF = () => {
    // In a real application, this would generate and download a PDF
    alert('Exporting Teaching Performance Report as PDF...');
  };

  // Handle View All toggle
  const handleViewAllToggle = () => {
    setShowAllCourses(!showAllCourses);
    setCurrentPage(1);
  };

  // Get unique terms for filter dropdown
  const uniqueTerms = [...new Set(allCourses.map(course => `${course.semester} ${course.year}`))];

  // Get sort indicator
  const getSortIndicator = (column) => {
    if (sortBy !== column) return null;
    return (
      <svg className={`inline ml-1 w-4 h-4 transition-transform ${
        sortOrder === 'desc' ? 'rotate-180' : ''
      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Teaching Performance
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Course evaluations, student feedback, and teaching effectiveness metrics
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={handleExportPDF} className="bg-purple-600 hover:bg-purple-700 text-white">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Teaching Metrics Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{teachingMetrics.overall_rating}/5.0</div>
            <div className="text-sm text-gray-500 mt-1">Overall Rating</div>
            <Progress
              value={teachingMetrics.overall_rating}
              max={5}
              color="primary"
              className="mt-2"
            />
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{teachingMetrics.teaching_quality}/5.0</div>
            <div className="text-sm text-gray-500 mt-1">Teaching Quality</div>
            <Progress
              value={teachingMetrics.teaching_quality}
              max={5}
              color="secondary"
              className="mt-2"
            />
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{teachingMetrics.total_students}</div>
            <div className="text-sm text-gray-500 mt-1">Total Students</div>
            <div className="text-xs text-gray-400 mt-1">Current Academic Year</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{teachingMetrics.response_rate}%</div>
            <div className="text-sm text-gray-500 mt-1">Response Rate</div>
            <div className="text-xs text-gray-400 mt-1">Student Evaluations</div>
          </div>
        </Card>
      </div>

      {/* Course List and Trend Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Course List */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <div className="flex justify-between items-center">
                <Card.Title>Course List</Card.Title>
                <button
                  onClick={handleViewAllToggle}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {showAllCourses ? 'Show Paged' : 'View All'}
                </button>
              </div>
            </Card.Header>

            {/* Search and Filter Controls */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search course or term"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Term Filter */}
                <div className="w-full sm:w-48">
                  <select
                    value={termFilter}
                    onChange={(e) => handleTermFilterChange(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Terms</option>
                    {uniqueTerms.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>

                {/* Score Filter */}
                <div className="w-full sm:w-32">
                  <select
                    value={scoreFilter}
                    onChange={(e) => handleScoreFilterChange(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  >
                    <option value={0}>Score ≥ 0</option>
                    <option value={3.5}>Score ≥ 3.5</option>
                    <option value={4.0}>Score ≥ 4.0</option>
                    <option value={4.5}>Score ≥ 4.5</option>
                  </select>
                </div>
              </div>
            </div>

            <Card.Content className="p-0">
              <div className="overflow-x-auto">
                <Table>
                <Table.Head>
                  <tr>
                    <Table.Header
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('course')}
                    >
                      Course {getSortIndicator('course')}
                    </Table.Header>
                    <Table.Header
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('term')}
                    >
                      Term {getSortIndicator('term')}
                    </Table.Header>
                    <Table.Header
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('enrollment')}
                    >
                      Enrollment {getSortIndicator('enrollment')}
                    </Table.Header>
                    <Table.Header
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('rating')}
                    >
                      Rating {getSortIndicator('rating')}
                    </Table.Header>
                    <Table.Header
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      Status {getSortIndicator('status')}
                    </Table.Header>
                  </tr>
                </Table.Head>
                <Table.Body>
                  {paginatedCourses.map((course, index) => (
                    <Table.Row key={course.id} index={index}>
                      <Table.Cell>
                        <div>
                          <div className="font-medium text-gray-900">{course.course_code}</div>
                          <div className="text-sm text-gray-500">{course.course_name}</div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-sm">
                          <div className="text-gray-900">{course.semester} {course.year}</div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-900">{course.enrollment}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{Number(course.avg_rating).toFixed(1)}/5.0</span>
                          <Badge
                            variant={getRatingColor(course.avg_rating)}
                            size="sm"
                          >
                            {getRatingLabel(course.avg_rating)}
                          </Badge>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          variant={course.status === 'Active' ? 'success' : 'secondary'}
                          size="sm"
                        >
                          {course.status}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
                </Table>
              </div>

              {/* Pagination */}
              {!showAllCourses && totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === i + 1
                              ? 'text-white bg-purple-600 border border-purple-600'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {filteredCourses.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No courses found</h3>
                  <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Teaching Breakdown */}
        <div>
          <Card>
            <Card.Header>
              <Card.Title>Teaching Breakdown</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-900">
                    <span>Teaching Quality</span>
                    <span>{teachingMetrics.teaching_quality}/5.0</span>
                  </div>
                  <Progress
                    value={teachingMetrics.teaching_quality}
                    max={5}
                    color="primary"
                    className="mt-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-900">
                    <span>Course Content</span>
                    <span>{teachingMetrics.course_content}/5.0</span>
                  </div>
                  <Progress
                    value={teachingMetrics.course_content}
                    max={5}
                    color="secondary"
                    className="mt-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-900">
                    <span>Availability</span>
                    <span>{teachingMetrics.availability}/5.0</span>
                  </div>
                  <Progress
                    value={teachingMetrics.availability}
                    max={5}
                    color="success"
                    className="mt-2"
                  />
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Evaluation Trends */}
      <Card>
        <Card.Header>
          <Card.Title>Student Evaluation Trends Over Time</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart */}
            <div className="lg:col-span-2">
              <LineChart
                data={lineChartData}
                title="Rating Progression"
                height="350px"
                className="mb-4"
              />
            </div>

            {/* Trend Summary */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Trend Summary</h4>
              <div className="space-y-4">
                {trendData.slice(-3).map((trend, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{trend.period}</div>
                        <div className="text-xs text-gray-500">{trend.evaluations} evaluations</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{trend.rating}/5.0</div>
                        <Badge variant={getRatingColor(trend.rating)} size="sm">
                          {getRatingLabel(trend.rating)}
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={trend.rating}
                      max={5}
                      color={getRatingColor(trend.rating)}
                      size="sm"
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>

              {/* Statistics */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h5 className="text-sm font-semibold text-blue-900 mb-2">Key Insights</h5>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Consistent improvement over 2 years</li>
                  <li>• Current rating: {trendData[trendData.length - 1].rating}/5.0</li>
                  <li>• Response rate: {teachingMetrics.response_rate}%</li>
                  <li>• Total evaluations: {teachingMetrics.total_evaluations}</li>
                </ul>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Recent Student Feedback */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Student Feedback</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="border-l-4 border-green-400 pl-4">
              <p className="text-sm text-gray-900">
                "Dr. Doe explains complex concepts very clearly and is always available for help. The course material is well-organized and engaging."
              </p>
              <p className="text-xs text-gray-500 mt-2">CS 101 - Fall 2024 - Rating: 5/5</p>
            </div>

            <div className="border-l-4 border-blue-400 pl-4">
              <p className="text-sm text-gray-900">
                "Great use of real-world examples to illustrate theoretical concepts. The assignments are challenging but fair."
              </p>
              <p className="text-xs text-gray-500 mt-2">CS 201 - Spring 2024 - Rating: 4/5</p>
            </div>

            <div className="border-l-4 border-purple-400 pl-4">
              <p className="text-sm text-gray-900">
                "Excellent feedback on assignments and very responsive to questions. The class discussions are very valuable."
              </p>
              <p className="text-xs text-gray-500 mt-2">CS 301 - Fall 2023 - Rating: 5/5</p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Teaching;