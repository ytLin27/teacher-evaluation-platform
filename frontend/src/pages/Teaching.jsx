import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Progress, LineChart } from '../components/ui';

const Teaching = () => {
  const [teachingData, setTeachingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Mock data for courses (enhanced with real data when available)
  const courses = [
    {
      id: 1,
      course_code: 'CS 101',
      course_name: 'Introduction to Computer Science',
      semester: 'Fall',
      year: 2024,
      enrollment: 45,
      avg_rating: 4.6,
      evaluation_count: 42
    },
    {
      id: 2,
      course_code: 'CS 201',
      course_name: 'Data Structures and Algorithms',
      semester: 'Spring',
      year: 2024,
      enrollment: 38,
      avg_rating: 4.3,
      evaluation_count: 35
    },
    {
      id: 3,
      course_code: 'CS 301',
      course_name: 'Database Systems',
      semester: 'Fall',
      year: 2023,
      enrollment: 32,
      avg_rating: 4.8,
      evaluation_count: 30
    },
    {
      id: 4,
      course_code: 'CS 401',
      course_name: 'Software Engineering',
      semester: 'Spring',
      year: 2023,
      enrollment: 28,
      avg_rating: 4.4,
      evaluation_count: 26
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
              <Card.Title>Course List</Card.Title>
            </Card.Header>
            <Card.Content className="p-0">
              <Table>
                <Table.Head>
                  <tr>
                    <Table.Header>Course</Table.Header>
                    <Table.Header>Semester</Table.Header>
                    <Table.Header>Enrollment</Table.Header>
                    <Table.Header>Rating</Table.Header>
                    <Table.Header>Evaluations</Table.Header>
                  </tr>
                </Table.Head>
                <Table.Body>
                  {courses.map((course, index) => (
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
                        <span className="text-sm text-gray-900">{course.enrollment} students</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{course.avg_rating}/5.0</span>
                          <Badge
                            variant={getRatingColor(course.avg_rating)}
                            size="sm"
                          >
                            {getRatingLabel(course.avg_rating)}
                          </Badge>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-900">{course.evaluation_count}</span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
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