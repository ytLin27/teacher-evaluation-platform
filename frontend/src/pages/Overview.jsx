import React, { useState, useEffect } from 'react';
import { Card, Progress, Badge, RadarChart, LineChart, BoxPlotChart, Tabs } from '../components/ui';

const Overview = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch teacher data from API
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/teachers/1/evaluation');
        if (!response.ok) {
          throw new Error('Failed to fetch teacher data');
        }
        const data = await response.json();
        setTeacherData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
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

  const metrics = teacherData?.evaluation || {
    overall_score: 4.3,
    teaching_effectiveness: 4.5,
    research_output: 4.1,
    service_contribution: 4.0,
    grant_funding: 3.8
  };

  // Prepare radar chart data
  const radarData = {
    labels: [
      'Teaching Effectiveness',
      'Research Output',
      'Service Contribution',
      'Grant Funding',
      'Professional Development'
    ],
    datasets: [
      {
        label: 'Performance Score',
        data: [
          metrics.teaching_effectiveness || 4.5,
          metrics.research_output || 4.1,
          metrics.service_contribution || 4.0,
          metrics.grant_funding || 3.8,
          4.2 // Professional development placeholder
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  };

  const stats = {
    total_evaluations: teacherData?.metrics?.teaching?.total_evaluations || 156,
    publications: teacherData?.metrics?.research?.publications || 23,
    active_grants: teacherData?.metrics?.research?.grants || 3,
    service_hours: teacherData?.metrics?.service?.total_hours || 120
  };

  const recentActivity = [
    { type: 'evaluation', title: 'New student evaluation received', date: '2024-01-15', score: 4.8 },
    { type: 'publication', title: 'Paper published in IEEE Transactions', date: '2024-01-10', impact: 'High Impact' },
    { type: 'grant', title: 'NSF Grant funding approved', date: '2024-01-05', amount: '$150,000' },
    { type: 'service', title: 'Committee meeting attended', date: '2024-01-03', hours: 3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Performance Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive view of teaching, research, and service metrics
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <span className="text-sm text-gray-500">Last updated: January 15, 2024</span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-100 truncate">Overall Score</dt>
                <dd className="text-lg font-semibold text-white">{metrics.overall_score}/5.0</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Teaching Score</dt>
                <dd className="text-lg font-semibold text-gray-900">{metrics.teaching_effectiveness}/5.0</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Research Output</dt>
                <dd className="text-lg font-semibold text-gray-900">{metrics.research_output}/5.0</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Service Score</dt>
                <dd className="text-lg font-semibold text-gray-900">{metrics.service_contribution}/5.0</dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultTab="overview" className="space-y-6">
        <Tabs.TabPane tabId="overview" label="Overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Performance Radar Chart */}
            <div className="lg:col-span-2">
              <Card>
                <Card.Header>
                  <Card.Title>Performance Overview</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <RadarChart
                        data={radarData}
                        title="Performance Radar"
                        className="mb-4"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h4>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-sm font-medium text-gray-900">
                            <span>Teaching Effectiveness</span>
                            <span>{metrics.teaching_effectiveness}/5.0</span>
                          </div>
                          <Progress
                            value={metrics.teaching_effectiveness}
                            max={5}
                            color="primary"
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm font-medium text-gray-900">
                            <span>Research Output</span>
                            <span>{metrics.research_output}/5.0</span>
                          </div>
                          <Progress
                            value={metrics.research_output}
                            max={5}
                            color="secondary"
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm font-medium text-gray-900">
                            <span>Service Contribution</span>
                            <span>{metrics.service_contribution}/5.0</span>
                          </div>
                          <Progress
                            value={metrics.service_contribution}
                            max={5}
                            color="success"
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm font-medium text-gray-900">
                            <span>Grant Funding</span>
                            <span>{metrics.grant_funding}/5.0</span>
                          </div>
                          <Progress
                            value={metrics.grant_funding}
                            max={5}
                            color="warning"
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Quick Stats */}
            <div>
              <Card>
                <Card.Header>
                  <Card.Title>Quick Stats</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Student Evaluations</span>
                      <span className="text-lg font-semibold text-gray-900">{stats.total_evaluations}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Publications</span>
                      <span className="text-lg font-semibold text-gray-900">{stats.publications}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Active Grants</span>
                      <span className="text-lg font-semibold text-gray-900">{stats.active_grants}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-500">Service Hours</span>
                      <span className="text-lg font-semibold text-gray-900">{stats.service_hours}</span>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane tabId="trends" label="Trends">
          <TrendsContent metrics={metrics} stats={stats} />
        </Tabs.TabPane>

        <Tabs.TabPane tabId="peers" label="Peer Comparison">
          <PeerComparisonContent metrics={metrics} />
        </Tabs.TabPane>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Activity</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivity.map((activity, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index !== recentActivity.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          activity.type === 'evaluation' ? 'bg-green-500' :
                          activity.type === 'publication' ? 'bg-blue-500' :
                          activity.type === 'grant' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}>
                          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-900">{activity.title}</p>
                          <div className="mt-1 flex items-center space-x-2">
                            {activity.score && (
                              <Badge variant="success" size="sm">
                                Score: {activity.score}
                              </Badge>
                            )}
                            {activity.impact && (
                              <Badge variant="primary" size="sm">
                                {activity.impact}
                              </Badge>
                            )}
                            {activity.amount && (
                              <Badge variant="warning" size="sm">
                                {activity.amount}
                              </Badge>
                            )}
                            {activity.hours && (
                              <Badge variant="info" size="sm">
                                {activity.hours} hours
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {activity.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

// Trends Content Component
const TrendsContent = ({ metrics, stats }) => {
  const trendsData = {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Overall Performance',
        data: [3.2, 3.6, 4.0, 4.2, metrics.overall_score || 4.3],
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Teaching Score',
        data: [3.5, 3.8, 4.1, 4.3, metrics.teaching_effectiveness || 4.5],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Research Score',
        data: [2.8, 3.2, 3.7, 4.0, metrics.research_output || 4.1],
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      }
    ],
  };

  const growthMetrics = [
    {
      title: 'Teaching Growth',
      current: metrics.teaching_effectiveness || 4.5,
      previous: 4.3,
      change: '+4.7%',
      trend: 'up'
    },
    {
      title: 'Research Growth',
      current: metrics.research_output || 4.1,
      previous: 4.0,
      change: '+2.5%',
      trend: 'up'
    },
    {
      title: 'Service Growth',
      current: metrics.service_contribution || 4.0,
      previous: 3.8,
      change: '+5.3%',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Performance Trends Chart */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>Performance Trends (5 Years)</Card.Title>
            </Card.Header>
            <Card.Content>
              <LineChart
                data={trendsData}
                title="Performance Evolution"
                height="400px"
              />
            </Card.Content>
          </Card>
        </div>

        {/* Growth Metrics */}
        <div>
          <Card>
            <Card.Header>
              <Card.Title>Year-over-Year Growth</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {growthMetrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">{metric.title}</span>
                      <Badge variant={metric.trend === 'up' ? 'success' : 'warning'} size="sm">
                        {metric.change}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">{metric.current}</span>
                      <span className="text-sm text-gray-500">from {metric.previous}</span>
                    </div>
                    <Progress
                      value={metric.current}
                      max={5}
                      color="success"
                      size="sm"
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Trend Insights */}
      <Card>
        <Card.Header>
          <Card.Title>Trend Analysis & Insights</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h4 className="font-semibold text-green-800">Positive Trend</h4>
              </div>
              <p className="text-sm text-green-700">
                Consistent improvement across all metrics over the past 5 years
              </p>
            </div>

            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h4 className="font-semibold text-blue-800">Peak Performance</h4>
              </div>
              <p className="text-sm text-blue-700">
                Current year shows highest performance scores in all categories
              </p>
            </div>

            <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h4 className="font-semibold text-purple-800">Research Growth</h4>
              </div>
              <p className="text-sm text-purple-700">
                Research output acceleration noted in the last 2 years
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

// Peer Comparison Content Component
const PeerComparisonContent = ({ metrics }) => {
  // Mock peer comparison data
  const peerData = {
    departments: [
      { name: 'Computer Science', average: 4.2 },
      { name: 'Mathematics', average: 4.0 },
      { name: 'Physics', average: 3.9 },
      { name: 'Chemistry', average: 4.1 },
      { name: 'Biology', average: 3.8 }
    ],
    percentiles: [
      { p25: 3.5, median: 4.0, p75: 4.5 },
      { p25: 3.3, median: 3.8, p75: 4.3 },
      { p25: 3.2, median: 3.7, p75: 4.2 },
      { p25: 3.4, median: 3.9, p75: 4.4 },
      { p25: 3.1, median: 3.6, p75: 4.1 }
    ],
    currentScore: metrics.overall_score || 4.3,
    currentPosition: 0 // Position in Computer Science dept
  };

  const rankingStats = [
    {
      metric: 'Overall Performance',
      yourScore: metrics.overall_score || 4.3,
      deptAverage: 4.2,
      rank: '8th',
      percentile: '78%',
      totalTeachers: 45
    },
    {
      metric: 'Teaching Effectiveness',
      yourScore: metrics.teaching_effectiveness || 4.5,
      deptAverage: 4.1,
      rank: '5th',
      percentile: '85%',
      totalTeachers: 45
    },
    {
      metric: 'Research Output',
      yourScore: metrics.research_output || 4.1,
      deptAverage: 4.0,
      rank: '12th',
      percentile: '73%',
      totalTeachers: 45
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Department Comparison Chart */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>Department Performance Comparison</Card.Title>
            </Card.Header>
            <Card.Content>
              <BoxPlotChart
                data={peerData}
                title="Your Performance vs Department Averages"
                height="400px"
              />
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Your Score: {peerData.currentScore}/5.0
                </p>
                <p className="mt-1">
                  You rank in the <strong>78th percentile</strong> among Computer Science faculty
                </p>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Ranking Statistics */}
        <div>
          <Card>
            <Card.Header>
              <Card.Title>Your Rankings</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {rankingStats.map((stat, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{stat.metric}</h4>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-purple-600">{stat.yourScore}/5.0</span>
                      <Badge variant="primary" size="sm">{stat.rank}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Dept. avg: {stat.deptAverage}/5.0</div>
                      <div>{stat.percentile} percentile</div>
                      <div>Out of {stat.totalTeachers} faculty</div>
                    </div>
                    <Progress
                      value={(stat.yourScore / stat.deptAverage) * 100}
                      max={150}
                      color={stat.yourScore > stat.deptAverage ? 'success' : 'warning'}
                      size="sm"
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Peer Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Strengths Compared to Peers</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-800">Teaching Quality</span>
                <div className="flex items-center">
                  <span className="text-xs text-green-600 mr-2">+0.4 above avg</span>
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-800">Student Engagement</span>
                <div className="flex items-center">
                  <span className="text-xs text-blue-600 mr-2">Top 15%</span>
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-800">Research Impact</span>
                <div className="flex items-center">
                  <span className="text-xs text-purple-600 mr-2">+0.1 above avg</span>
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Improvement Opportunities</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-yellow-800">Grant Funding</span>
                <div className="flex items-center">
                  <span className="text-xs text-yellow-600 mr-2">-0.2 below avg</span>
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-orange-800">Service Leadership</span>
                <div className="flex items-center">
                  <span className="text-xs text-orange-600 mr-2">65th percentile</span>
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12l4-4m-4 4l4 4" />
                  </svg>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Recommendation</span>
                <p className="text-xs text-gray-600 mt-1">
                  Consider applying for larger federal grants to improve funding metrics
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Overview;