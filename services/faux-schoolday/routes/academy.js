/**
 * Academy API Routes
 * 模拟 Schoolday Academy API - 专业发展课程推荐系统
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// 验证中间件
function authenticateAcademy(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Bearer token required for Academy API access'
    });
  }

  next();
}

router.use(authenticateAcademy);

/**
 * Academy API Info
 */
router.get('/', (req, res) => {
  res.json({
    service: 'Schoolday Academy API',
    version: '3.0',
    description: 'Professional development course recommendations and management',
    endpoints: {
      courses: '/courses',
      recommendations: '/recommendations',
      enrollments: '/enrollments',
      certifications: '/certifications'
    },
    features: [
      'AI-powered course recommendations',
      'Skill gap analysis',
      'Progress tracking',
      'Certification management',
      'Peer learning networks'
    ]
  });
});

/**
 * Get Available Courses
 */
router.get('/courses', (req, res) => {
  try {
    const {
      category,
      level,
      duration,
      format,
      search,
      limit = 20,
      offset = 0
    } = req.query;

    let courses = generateCourses();

    // 应用过滤器
    if (category) {
      courses = courses.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }

    if (level) {
      courses = courses.filter(c => c.level.toLowerCase() === level.toLowerCase());
    }

    if (duration) {
      const [min, max] = duration.split('-').map(Number);
      courses = courses.filter(c => c.duration_hours >= min && c.duration_hours <= max);
    }

    if (format) {
      courses = courses.filter(c => c.format.toLowerCase() === format.toLowerCase());
    }

    if (search) {
      const searchLower = search.toLowerCase();
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // 分页
    const total = courses.length;
    const paginatedCourses = courses.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      courses: paginatedCourses,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      },
      filters: {
        category,
        level,
        duration,
        format,
        search
      },
      categories: [
        'Instructional Design',
        'Classroom Management',
        'Technology Integration',
        'Assessment & Evaluation',
        'Student Engagement',
        'Leadership Development'
      ]
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Get Course by ID
 */
router.get('/courses/:id', (req, res) => {
  try {
    const courseId = req.params.id;
    const courses = generateCourses();
    const course = courses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({
        error: 'not_found',
        message: `Course with ID ${courseId} not found`
      });
    }

    // 增强的课程详情
    const detailedCourse = {
      ...course,
      modules: generateCourseModules(course.category),
      prerequisites: generatePrerequisites(),
      learning_outcomes: generateLearningOutcomes(course.category),
      instructor: generateInstructor(),
      reviews: generateReviews(),
      related_courses: courses.filter(c =>
        c.category === course.category && c.id !== courseId
      ).slice(0, 3)
    };

    res.json({ course: detailedCourse });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Get Course Recommendations for Teacher
 */
router.get('/recommendations', (req, res) => {
  try {
    const {
      teacher_id,
      subject_area,
      skill_level,
      career_goals,
      time_availability,
      limit = 10
    } = req.query;

    if (!teacher_id) {
      return res.status(400).json({
        error: 'missing_parameter',
        message: 'teacher_id parameter is required'
      });
    }

    const courses = generateCourses();

    // 模拟智能推荐算法
    let recommendations = courses.map(course => ({
      ...course,
      recommendation_score: Math.random() * 100,
      recommendation_reasons: generateRecommendationReasons(course, {
        subject_area,
        skill_level,
        career_goals
      }),
      estimated_impact: {
        teaching_effectiveness: (Math.random() * 30 + 10).toFixed(1) + '%',
        student_engagement: (Math.random() * 25 + 15).toFixed(1) + '%',
        career_advancement: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low'
      }
    }));

    // 应用推荐逻辑
    if (subject_area) {
      recommendations = recommendations.map(rec => {
        if (rec.tags.includes(subject_area) || rec.category.includes(subject_area)) {
          rec.recommendation_score += 20;
        }
        return rec;
      });
    }

    if (time_availability) {
      const maxHours = parseInt(time_availability);
      recommendations = recommendations.filter(rec => rec.duration_hours <= maxHours);
    }

    // 按推荐分数排序
    recommendations.sort((a, b) => b.recommendation_score - a.recommendation_score);

    // 限制结果数量
    recommendations = recommendations.slice(0, parseInt(limit));

    res.json({
      recommendations,
      recommendation_metadata: {
        teacher_id,
        algorithm_version: '3.0',
        generated_at: new Date().toISOString(),
        factors_considered: [
          'Teaching subject alignment',
          'Current skill level',
          'Career development goals',
          'Time availability',
          'Peer success rates',
          'District priorities'
        ]
      },
      personalization: {
        subject_area: subject_area || 'Not specified',
        skill_level: skill_level || 'Not specified',
        career_goals: career_goals || 'Not specified',
        time_availability: time_availability ? `${time_availability} hours/week` : 'Flexible'
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Course Enrollment Management
 */
router.post('/enrollments', (req, res) => {
  try {
    const {
      teacher_id,
      course_id,
      start_date,
      preferred_schedule
    } = req.body;

    if (!teacher_id || !course_id) {
      return res.status(400).json({
        error: 'missing_parameters',
        message: 'teacher_id and course_id are required'
      });
    }

    const enrollmentId = uuidv4();
    const enrollment = {
      enrollment_id: enrollmentId,
      teacher_id,
      course_id,
      status: 'enrolled',
      enrolled_at: new Date().toISOString(),
      start_date: start_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      preferred_schedule: preferred_schedule || 'flexible',
      progress: {
        completion_percentage: 0,
        modules_completed: 0,
        estimated_completion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      cohort_info: {
        cohort_id: `cohort_${Math.floor(Date.now() / 1000)}`,
        peer_count: 15 + Math.floor(Math.random() * 10),
        facilitator: generateInstructor().name
      }
    };

    res.status(201).json({ enrollment });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Get Teacher Enrollments
 */
router.get('/enrollments', (req, res) => {
  try {
    const { teacher_id, status } = req.query;

    if (!teacher_id) {
      return res.status(400).json({
        error: 'missing_parameter',
        message: 'teacher_id parameter is required'
      });
    }

    const enrollments = generateEnrollments(teacher_id, status);

    res.json({
      enrollments,
      summary: {
        total_enrollments: enrollments.length,
        active_courses: enrollments.filter(e => e.status === 'enrolled' || e.status === 'in_progress').length,
        completed_courses: enrollments.filter(e => e.status === 'completed').length,
        total_hours_completed: enrollments
          .filter(e => e.status === 'completed')
          .reduce((sum, e) => sum + e.course_duration_hours, 0)
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Get Teacher Certifications
 */
router.get('/certifications', (req, res) => {
  try {
    const { teacher_id } = req.query;

    if (!teacher_id) {
      return res.status(400).json({
        error: 'missing_parameter',
        message: 'teacher_id parameter is required'
      });
    }

    const certifications = generateCertifications(teacher_id);

    res.json({
      certifications,
      certification_summary: {
        total_certifications: certifications.length,
        active_certifications: certifications.filter(c => c.status === 'active').length,
        renewal_required: certifications.filter(c =>
          c.status === 'active' &&
          new Date(c.expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        ).length
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

// 辅助函数

function generateCourses() {
  const categories = [
    'Instructional Design',
    'Classroom Management',
    'Technology Integration',
    'Assessment & Evaluation',
    'Student Engagement',
    'Leadership Development'
  ];

  const courseTitles = {
    'Instructional Design': [
      'Universal Design for Learning Fundamentals',
      'Differentiated Instruction Strategies',
      'Backward Design Methodology',
      'Cognitive Load Theory in Practice'
    ],
    'Classroom Management': [
      'Positive Behavior Interventions',
      'Restorative Justice in Schools',
      'Building Classroom Community',
      'Managing Diverse Learning Needs'
    ],
    'Technology Integration': [
      'Google Workspace for Education',
      'Interactive Whiteboard Mastery',
      'Flipped Classroom Implementation',
      'AI Tools for Teachers'
    ],
    'Assessment & Evaluation': [
      'Formative Assessment Techniques',
      'Authentic Assessment Design',
      'Data-Driven Instruction',
      'Student Self-Assessment Strategies'
    ],
    'Student Engagement': [
      'Gamification in Education',
      'Project-Based Learning',
      'Social-Emotional Learning Integration',
      'Mindfulness in the Classroom'
    ],
    'Leadership Development': [
      'Instructional Leadership',
      'School Culture Transformation',
      'Professional Learning Communities',
      'Change Management in Education'
    ]
  };

  const courses = [];

  categories.forEach(category => {
    courseTitles[category].forEach((title, index) => {
      courses.push({
        id: `course_${category.replace(/\s+/g, '_').toLowerCase()}_${index + 1}`,
        title,
        category,
        level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        format: ['Online', 'Hybrid', 'In-Person'][Math.floor(Math.random() * 3)],
        duration_hours: 8 + Math.floor(Math.random() * 32), // 8-40 hours
        price: Math.floor(Math.random() * 500) + 100,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        enrollments: Math.floor(Math.random() * 1000) + 50,
        description: `Comprehensive course covering ${title.toLowerCase()}. Designed for educators looking to enhance their ${category.toLowerCase()} skills.`,
        tags: generateCourseTags(category),
        provider: 'Schoolday Academy',
        accreditation: Math.random() > 0.3 ? 'CEU Eligible' : 'Certificate of Completion',
        next_start_date: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    });
  });

  return courses;
}

function generateCourseTags(category) {
  const tagOptions = {
    'Instructional Design': ['UDL', 'Differentiation', 'Curriculum', 'Planning'],
    'Classroom Management': ['Behavior', 'Community', 'Environment', 'Discipline'],
    'Technology Integration': ['EdTech', 'Digital Tools', 'Online Learning', 'Innovation'],
    'Assessment & Evaluation': ['Data', 'Testing', 'Feedback', 'Analytics'],
    'Student Engagement': ['Motivation', 'Active Learning', 'Participation', 'SEL'],
    'Leadership Development': ['Management', 'Vision', 'Collaboration', 'Change']
  };

  return tagOptions[category] || ['Education', 'Teaching'];
}

function generateCourseModules(category) {
  const moduleTemplates = {
    'Instructional Design': [
      'Understanding Learning Differences',
      'Creating Accessible Content',
      'Assessment Strategies',
      'Implementation Planning'
    ],
    'Technology Integration': [
      'Tool Overview and Setup',
      'Basic Features and Functions',
      'Advanced Applications',
      'Troubleshooting and Support'
    ]
  };

  const modules = moduleTemplates[category] || [
    'Introduction and Overview',
    'Core Concepts',
    'Practical Applications',
    'Assessment and Reflection'
  ];

  return modules.map((title, index) => ({
    module_number: index + 1,
    title,
    duration_hours: 2 + Math.floor(Math.random() * 4),
    completion_required: true,
    materials: ['Video lessons', 'Reading materials', 'Practice exercises', 'Discussion forum']
  }));
}

function generatePrerequisites() {
  const options = [
    'Basic computer literacy',
    'Teaching experience (1+ years)',
    'Completion of Introduction to Education course',
    'Administrative approval'
  ];

  return Math.random() > 0.5 ?
    [options[Math.floor(Math.random() * options.length)]] :
    ['None'];
}

function generateLearningOutcomes(category) {
  const outcomes = {
    'Instructional Design': [
      'Apply UDL principles to lesson planning',
      'Create differentiated learning materials',
      'Assess student learning effectively'
    ],
    'Technology Integration': [
      'Integrate digital tools seamlessly',
      'Troubleshoot common technical issues',
      'Enhance student engagement through technology'
    ]
  };

  return outcomes[category] || [
    'Demonstrate improved teaching practices',
    'Apply course concepts in classroom setting',
    'Reflect on professional growth'
  ];
}

function generateInstructor() {
  const names = ['Dr. Sarah Johnson', 'Prof. Michael Chen', 'Dr. Jennifer Lopez', 'Prof. David Williams'];
  const name = names[Math.floor(Math.random() * names.length)];

  return {
    name,
    credentials: 'Ed.D., M.Ed.',
    experience_years: 10 + Math.floor(Math.random() * 15),
    rating: (4.0 + Math.random() * 1.0).toFixed(1),
    bio: `${name} is an experienced educator and instructional designer with extensive experience in professional development.`
  };
}

function generateReviews() {
  const reviews = [
    'Excellent course! Very practical and applicable.',
    'Great instructor and well-organized content.',
    'Helped me improve my classroom management significantly.',
    'Would recommend to all teachers.'
  ];

  return Array.from({ length: 3 }, () => ({
    reviewer: `Teacher ${Math.floor(Math.random() * 1000)}`,
    rating: 4 + Math.floor(Math.random() * 2),
    comment: reviews[Math.floor(Math.random() * reviews.length)],
    date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));
}

function generateRecommendationReasons(course, teacherProfile) {
  const reasons = [
    `Aligns with your ${teacherProfile.subject_area || 'teaching'} focus`,
    'High completion rates among similar teachers',
    'Addresses current educational trends',
    'Builds on your existing expertise'
  ];

  return reasons.slice(0, 2 + Math.floor(Math.random() * 2));
}

function generateEnrollments(teacherId, statusFilter) {
  const statuses = ['enrolled', 'in_progress', 'completed', 'paused'];
  const courses = generateCourses().slice(0, 5);

  return courses.map(course => ({
    enrollment_id: uuidv4(),
    teacher_id: teacherId,
    course_id: course.id,
    course_title: course.title,
    course_duration_hours: course.duration_hours,
    status: statusFilter || statuses[Math.floor(Math.random() * statuses.length)],
    progress_percentage: Math.floor(Math.random() * 101),
    enrolled_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    last_accessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  })).filter(enrollment => !statusFilter || enrollment.status === statusFilter);
}

function generateCertifications(teacherId) {
  const certNames = [
    'Google for Education Certified Trainer',
    'Microsoft Innovative Educator',
    'Instructional Design Specialist',
    'Digital Citizenship Educator'
  ];

  return certNames.map(name => ({
    certification_id: uuidv4(),
    teacher_id: teacherId,
    name,
    issuer: 'Schoolday Academy',
    issue_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + (365 + Math.random() * 730) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: Math.random() > 0.1 ? 'active' : 'expired',
    badge_url: `https://api.schoolday.com/badges/${name.replace(/\s+/g, '_').toLowerCase()}.png`
  }));
}

module.exports = router;