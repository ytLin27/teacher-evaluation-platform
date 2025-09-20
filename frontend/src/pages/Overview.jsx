import React from 'react';
import { Card, Progress, Badge } from '../components/ui';

const Overview = () => {
  // Mock data for demonstration
  const metrics = {
    overall_score: 4.3,
    teaching_effectiveness: 4.5,
    research_output: 4.1,
    service_contribution: 4.0,
    grant_funding: 3.8
  };

  const stats = {
    total_evaluations: 156,
    publications: 23,
    active_grants: 3,
    service_hours: 120
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Performance Breakdown */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>Performance Breakdown</Card.Title>
            </Card.Header>
            <Card.Content>
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

export default Overview;