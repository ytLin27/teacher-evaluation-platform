import React from 'react';
import { Card, Badge, Button } from '../components/ui';

const Career = () => {
  // Event handlers for buttons
  const handleDownloadResume = async () => {
    console.log('Download Resume clicked');
    try {
      // 导出职业历程数据为CSV格式
      const response = await fetch('http://localhost:3001/api/exports/career/1?format=csv');

      if (response.ok) {
        // 创建下载链接
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `career_history_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert('Career history exported successfully!');
      } else {
        alert('Failed to export career data. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed due to network error. Please check your connection.');
    }
  };

  const handleUpdateProfile = () => {
    console.log('Update Profile clicked');
    alert('Update Profile functionality will be implemented soon!');
  };

  // Mock career data
  const careerTimeline = [
    {
      id: 1,
      position: 'Associate Professor',
      institution: 'State University',
      department: 'Computer Science',
      start_date: '2020-09-01',
      end_date: null,
      current: true,
      description: 'Leading research in educational technology and machine learning applications in education.',
      achievements: [
        'Secured $400K in research funding',
        'Published 12 peer-reviewed papers',
        'Developed 3 new courses',
        'Mentored 8 Ph.D. students'
      ]
    },
    {
      id: 2,
      position: 'Assistant Professor',
      institution: 'State University',
      department: 'Computer Science',
      start_date: '2015-08-01',
      end_date: '2020-08-31',
      current: false,
      description: 'Established research program in AI-powered educational tools and adaptive learning systems.',
      achievements: [
        'Received NSF CAREER Award',
        'Published 15 research papers',
        'Built collaborative research network',
        'Won teaching excellence award'
      ]
    },
    {
      id: 3,
      position: 'Postdoctoral Researcher',
      institution: 'MIT',
      department: 'Computer Science and Artificial Intelligence Laboratory',
      start_date: '2013-09-01',
      end_date: '2015-07-31',
      current: false,
      description: 'Conducted research on machine learning applications in personalized education.',
      achievements: [
        'Co-authored 8 publications',
        'Developed ML algorithms for education',
        'Collaborated with industry partners',
        'Presented at 12 conferences'
      ]
    }
  ];

  const awards = [
    {
      id: 1,
      title: 'Excellence in Teaching Award',
      issuer: 'State University',
      year: '2024',
      category: 'Teaching',
      description: 'Recognized for innovative teaching methods and outstanding student evaluations.'
    },
    {
      id: 2,
      title: 'NSF CAREER Award',
      issuer: 'National Science Foundation',
      year: '2018',
      category: 'Research',
      description: 'Five-year research grant for developing AI-powered educational assessment tools.'
    },
    {
      id: 3,
      title: 'Best Paper Award',
      issuer: 'International Conference on Educational Data Mining',
      year: '2023',
      category: 'Research',
      description: 'Paper on "Adaptive Learning Pathways using Deep Reinforcement Learning".'
    },
    {
      id: 4,
      title: 'Outstanding Service Award',
      issuer: 'IEEE Computer Society',
      year: '2022',
      category: 'Service',
      description: 'Recognized for exceptional service to the professional community.'
    },
    {
      id: 5,
      title: 'Early Career Researcher Award',
      issuer: 'Association for Computing Machinery',
      year: '2019',
      category: 'Research',
      description: 'Awarded for significant contributions to educational technology research.'
    }
  ];

  const milestones = [
    {
      year: '2024',
      title: 'Promoted to Associate Professor with Tenure',
      description: 'Achieved tenure and promotion based on excellence in research, teaching, and service.'
    },
    {
      year: '2023',
      title: 'Established AI Education Research Lab',
      description: 'Founded dedicated research laboratory focusing on AI applications in education.'
    },
    {
      year: '2021',
      title: 'Reached 1000 Citations',
      description: 'Academic work has been cited over 1000 times by peer researchers.'
    },
    {
      year: '2020',
      title: 'Launched Educational Technology Startup',
      description: 'Co-founded company developing AI-powered tutoring systems for K-12 education.'
    },
    {
      year: '2018',
      title: 'Received NSF CAREER Award',
      description: 'Awarded prestigious early-career grant for educational technology research.'
    }
  ];

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'teaching': return 'success';
      case 'research': return 'primary';
      case 'service': return 'warning';
      case 'leadership': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const formatDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const years = Math.floor((end - start) / (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor(((end - start) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Career Journey
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Professional timeline, achievements, and career milestones
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button variant="outline" size="sm" onClick={handleDownloadResume}>
            Download Resume
          </Button>
          <Button variant="primary" size="sm" onClick={handleUpdateProfile}>
            Update Profile
          </Button>
        </div>
      </div>

      {/* Career Timeline */}
      <Card>
        <Card.Header>
          <Card.Title>Professional Timeline</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flow-root">
            <ul className="-mb-8">
              {careerTimeline.map((position, index) => (
                <li key={position.id}>
                  <div className="relative pb-8">
                    {index !== careerTimeline.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          position.current ? 'bg-purple-500' : 'bg-gray-400'
                        }`}>
                          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-medium text-gray-900">{position.position}</h3>
                              {position.current && (
                                <Badge variant="success" size="sm">Current</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {position.institution} • {position.department}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(position.start_date)} - {formatDate(position.end_date)} •
                              {formatDuration(position.start_date, position.end_date)}
                            </p>
                            <p className="text-sm text-gray-700 mt-2">{position.description}</p>

                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Key Achievements:</h4>
                              <ul className="space-y-1">
                                {position.achievements.map((achievement, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 flex items-start">
                                    <span className="text-purple-500 mr-2">•</span>
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
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

      {/* Awards and Recognition */}
      <Card>
        <Card.Header>
          <Card.Title>Awards & Recognition</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {awards.map((award) => (
              <div key={award.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">{award.title}</h4>
                      <Badge variant={getCategoryColor(award.category)} size="sm">
                        {award.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{award.issuer}</p>
                    <p className="text-sm text-gray-700 mt-2">{award.description}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="text-lg font-bold text-purple-600">{award.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Career Milestones */}
      <Card>
        <Card.Header>
          <Card.Title>Career Milestones</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{milestone.year}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{milestone.title}</h4>
                  <p className="text-sm text-gray-700 mt-1">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Career Statistics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Career Statistics</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">9</div>
                <div className="text-sm text-gray-600 mt-1">Years in Academia</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">23</div>
                <div className="text-sm text-gray-600 mt-1">Publications</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">$425K</div>
                <div className="text-sm text-gray-600 mt-1">Grants Secured</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">15</div>
                <div className="text-sm text-gray-600 mt-1">PhD Students Mentored</div>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Professional Impact</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Citation Count</span>
                <span className="text-lg font-bold text-gray-900">1,247</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">H-Index</span>
                <span className="text-lg font-bold text-gray-900">18</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Conference Presentations</span>
                <span className="text-lg font-bold text-gray-900">45</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Patents Filed</span>
                <span className="text-lg font-bold text-gray-900">3</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Career;