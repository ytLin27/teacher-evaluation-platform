import React, { useState } from 'react';
import { Card, Table, Badge, Button, Progress } from '../components/ui';
import AddCertificationForm from '../components/forms/AddCertificationForm';
import { useToast } from '../contexts/ToastContext';

const Professional = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { showSuccess, showError } = useToast();

  // Event handlers for buttons
  const handleDownloadCV = async () => {
    console.log('Download CV clicked');
    setIsDownloading(true);

    try {
      // 导出专业发展数据为CSV格式
      const response = await fetch('http://localhost:3001/api/exports/professional/1?format=csv');

      if (response.ok) {
        // 创建下载链接
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `professional_development_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showSuccess('CV 已下载');
      } else {
        showError(`Failed to download CV (${response.status}). Please try again.`);
      }
    } catch (error) {
      console.error('Download error:', error);
      showError(`Download failed: ${error.message}. Please check your connection and retry.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddCertification = () => {
    console.log('Add Certification clicked');
    setShowAddForm(true);
  };

  const handleAddSuccess = (newCertification) => {
    console.log('New certification added:', newCertification);
    showSuccess('已新增认证');
    // Here you would normally refresh the certifications list
    // For now, we'll just show the success message
  };

  // Mock professional development data
  const education = [
    {
      id: 1,
      degree: 'Ph.D. Computer Science',
      institution: 'Stanford University',
      year: '2015',
      specialization: 'Machine Learning and Educational Technology',
      gpa: '3.95'
    },
    {
      id: 2,
      degree: 'M.S. Computer Science',
      institution: 'MIT',
      year: '2011',
      specialization: 'Artificial Intelligence',
      gpa: '3.87'
    },
    {
      id: 3,
      degree: 'B.S. Computer Engineering',
      institution: 'UC Berkeley',
      year: '2009',
      specialization: 'Software Engineering',
      gpa: '3.92'
    }
  ];

  const certifications = [
    {
      id: 1,
      title: 'Certified Machine Learning Professional',
      issuer: 'Google Cloud',
      date: '2024-01-15',
      expiry: '2026-01-15',
      status: 'Active',
      category: 'Technical'
    },
    {
      id: 2,
      title: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023-06-20',
      expiry: '2026-06-20',
      status: 'Active',
      category: 'Technical'
    },
    {
      id: 3,
      title: 'Certified Educator in Online Learning',
      issuer: 'University Professional Association',
      date: '2023-03-10',
      expiry: '2025-03-10',
      status: 'Active',
      category: 'Education'
    },
    {
      id: 4,
      title: 'Project Management Professional (PMP)',
      issuer: 'Project Management Institute',
      date: '2022-09-15',
      expiry: '2025-09-15',
      status: 'Active',
      category: 'Management'
    }
  ];

  const professionalDevelopment = [
    {
      id: 1,
      title: 'Advanced Machine Learning Workshop',
      provider: 'Stanford AI Lab',
      type: 'Workshop',
      date: '2024-02-20',
      hours: 16,
      category: 'Technical Skills'
    },
    {
      id: 2,
      title: 'Educational Leadership Program',
      provider: 'Academic Leadership Institute',
      type: 'Course',
      date: '2023-11-15',
      hours: 40,
      category: 'Leadership'
    },
    {
      id: 3,
      title: 'Inclusive Teaching Practices',
      provider: 'Teaching Excellence Center',
      type: 'Seminar',
      date: '2023-09-10',
      hours: 8,
      category: 'Teaching'
    },
    {
      id: 4,
      title: 'Grant Writing Workshop',
      provider: 'National Science Foundation',
      type: 'Workshop',
      date: '2023-07-25',
      hours: 12,
      category: 'Research Skills'
    }
  ];

  const skills = [
    { name: 'Machine Learning', level: 95, category: 'Technical' },
    { name: 'Educational Technology', level: 90, category: 'Domain' },
    { name: 'Python/R Programming', level: 88, category: 'Technical' },
    { name: 'Curriculum Design', level: 85, category: 'Teaching' },
    { name: 'Research Methodology', level: 92, category: 'Research' },
    { name: 'Project Management', level: 78, category: 'Management' },
    { name: 'Statistical Analysis', level: 87, category: 'Technical' },
    { name: 'Team Leadership', level: 82, category: 'Leadership' }
  ];

  const professionalMemberships = [
    {
      id: 1,
      organization: 'IEEE Computer Society',
      role: 'Senior Member',
      since: '2018',
      status: 'Active'
    },
    {
      id: 2,
      organization: 'Association for Computing Machinery (ACM)',
      role: 'Professional Member',
      since: '2015',
      status: 'Active'
    },
    {
      id: 3,
      organization: 'International Society for Technology in Education',
      role: 'Member',
      since: '2020',
      status: 'Active'
    },
    {
      id: 4,
      organization: 'American Educational Research Association',
      role: 'Member',
      since: '2017',
      status: 'Active'
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'expired': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'technical': return 'primary';
      case 'education': return 'success';
      case 'management': return 'warning';
      case 'teaching': return 'info';
      case 'research skills': return 'secondary';
      case 'leadership': return 'primary';
      default: return 'default';
    }
  };

  const getSkillColor = (level) => {
    if (level >= 90) return 'success';
    if (level >= 80) return 'primary';
    if (level >= 70) return 'warning';
    return 'danger';
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
            Professional Development
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Education, certifications, skills, and professional growth
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button variant="outline" size="sm" onClick={handleDownloadCV} disabled={isDownloading}>
            {isDownloading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Downloading...
              </div>
            ) : (
              'Download CV'
            )}
          </Button>
          <Button variant="primary" size="sm" onClick={handleAddCertification}>
            Add Certification
          </Button>
        </div>
      </div>

      {/* Education Background */}
      <Card>
        <Card.Header>
          <Card.Title>Educational Background</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="border-l-4 border-purple-400 pl-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{edu.degree}</h4>
                    <p className="text-sm text-gray-600 mt-1">{edu.institution} • {edu.year}</p>
                    <p className="text-sm text-purple-600 mt-1">Specialization: {edu.specialization}</p>
                    {edu.gpa && <p className="text-xs text-gray-500 mt-1">GPA: {edu.gpa}/4.0</p>}
                  </div>
                  <Badge variant="secondary" size="sm">{edu.year}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Skills Assessment */}
      <Card>
        <Card.Header>
          <Card.Title>Skills Assessment</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {skills.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{skill.level}%</span>
                    <Badge variant={getCategoryColor(skill.category)} size="sm">
                      {skill.category}
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={skill.level}
                  max={100}
                  color={getSkillColor(skill.level)}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Certifications */}
      <Card>
        <Card.Header>
          <Card.Title>Professional Certifications</Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          <div className="overflow-x-auto">
            <Table>
            <Table.Head>
              <tr>
                <Table.Header>Certification</Table.Header>
                <Table.Header>Issuer</Table.Header>
                <Table.Header>Category</Table.Header>
                <Table.Header>Issue Date</Table.Header>
                <Table.Header>Expiry</Table.Header>
                <Table.Header>Status</Table.Header>
              </tr>
            </Table.Head>
            <Table.Body>
              {certifications.map((cert, index) => (
                <Table.Row key={cert.id} index={index}>
                  <Table.Cell>
                    <div className="font-medium text-gray-900 text-sm">{cert.title}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-900">{cert.issuer}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={getCategoryColor(cert.category)} size="sm">
                      {cert.category}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-500">{formatDate(cert.date)}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-500">{formatDate(cert.expiry)}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={getStatusColor(cert.status)} size="sm">
                      {cert.status}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            </Table>
          </div>
        </Card.Content>
      </Card>

      {/* Professional Development and Memberships */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Professional Development */}
        <Card>
          <Card.Header>
            <Card.Title>Recent Professional Development</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {professionalDevelopment.map((dev) => (
                <div key={dev.id} className="border-l-4 border-indigo-400 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{dev.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{dev.provider}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary" size="sm">{dev.type}</Badge>
                        <Badge variant={getCategoryColor(dev.category)} size="sm">
                          {dev.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{formatDate(dev.date)}</div>
                      <div className="text-xs text-gray-400 mt-1">{dev.hours} hours</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Professional Memberships */}
        <Card>
          <Card.Header>
            <Card.Title>Professional Memberships</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {professionalMemberships.map((membership) => (
                <div key={membership.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{membership.organization}</h4>
                    <p className="text-sm text-gray-600 mt-1">{membership.role}</p>
                    <p className="text-xs text-gray-500 mt-1">Member since {membership.since}</p>
                  </div>
                  <Badge variant={getStatusColor(membership.status)} size="sm">
                    {membership.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Professional Development Goals */}
      <Card>
        <Card.Header>
          <Card.Title>Development Goals & Achievements</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-900">Current Year Goals</h4>
              <ul className="text-sm text-purple-700 mt-2 space-y-1">
                <li>• Complete AI Ethics certification</li>
                <li>• Attend 2 international conferences</li>
                <li>• Develop new course curriculum</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900">Recent Achievements</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Earned Google ML Professional cert</li>
                <li>• Completed leadership program</li>
                <li>• Published 3 peer-reviewed papers</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-900">Long-term Vision</h4>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• Establish AI education research lab</li>
                <li>• Develop industry partnerships</li>
                <li>• Mentor next generation educators</li>
              </ul>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Add Certification Form Modal */}
      <AddCertificationForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default Professional;