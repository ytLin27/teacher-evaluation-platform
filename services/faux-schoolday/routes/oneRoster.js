/**
 * OneRoster API Implementation
 * 实现完整的 OneRoster v1.1 标准
 * 用于教师和课程数据同步
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const mockData = require('../utils/mockDataGenerator');
const router = express.Router();

// OneRoster API 验证中间件
function authenticateOneRoster(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Bearer token required for OneRoster API access'
    });
  }

  // 简化的令牌验证 - 实际应用中应该验证JWT
  const token = authHeader.substring(7);
  if (token.length < 10) {
    return res.status(401).json({
      error: 'invalid_token',
      message: 'Invalid access token'
    });
  }

  req.accessToken = token;
  next();
}

// 分页和过滤中间件
function parsePagination(req, res, next) {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;
  const sort = req.query.sort || 'dateLastModified';
  const orderBy = req.query.orderBy || 'asc';
  const filter = req.query.filter || '';

  req.pagination = {
    limit: Math.min(limit, 1000), // 最大1000条
    offset: Math.max(offset, 0),
    sort,
    orderBy: orderBy.toLowerCase() === 'desc' ? 'desc' : 'asc',
    filter
  };

  next();
}

// 应用所有中间件
router.use(authenticateOneRoster);
router.use(parsePagination);

/**
 * OneRoster Service Info
 */
router.get('/', (req, res) => {
  res.json({
    version: '1.1',
    standard: 'OneRoster',
    provider: 'Faux Schoolday API',
    description: 'OneRoster v1.1 compliant API for educational data exchange',
    endpoints: {
      orgs: '/orgs',
      users: '/users',
      courses: '/courses',
      classes: '/classes',
      enrollments: '/enrollments',
      academicSessions: '/academicSessions'
    },
    supported_operations: [
      'GET /orgs',
      'GET /orgs/{id}',
      'GET /users',
      'GET /users/{id}',
      'GET /courses',
      'GET /courses/{id}',
      'GET /orgs/{id}/users'
    ]
  });
});

/**
 * Organizations (Districts and Schools)
 */
router.get('/orgs', (req, res) => {
  try {
    let orgs = [
      ...mockData.getDistricts(),
      ...mockData.getSchools()
    ];

    // 应用过滤
    if (req.pagination.filter) {
      const filterLower = req.pagination.filter.toLowerCase();
      orgs = orgs.filter(org =>
        org.name.toLowerCase().includes(filterLower) ||
        org.identifier.toLowerCase().includes(filterLower)
      );
    }

    // 排序
    orgs.sort((a, b) => {
      const field = req.pagination.sort;
      const order = req.pagination.orderBy === 'desc' ? -1 : 1;

      if (a[field] < b[field]) return -1 * order;
      if (a[field] > b[field]) return 1 * order;
      return 0;
    });

    // 分页
    const total = orgs.length;
    const paginatedOrgs = orgs.slice(
      req.pagination.offset,
      req.pagination.offset + req.pagination.limit
    );

    res.json({
      orgs: paginatedOrgs,
      pagination: {
        total,
        limit: req.pagination.limit,
        offset: req.pagination.offset,
        hasMore: req.pagination.offset + req.pagination.limit < total
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
 * Get Organization by ID
 */
router.get('/orgs/:id', (req, res) => {
  try {
    const orgId = req.params.id;

    // 查找学区
    let org = mockData.getDistricts().find(d => d.sourcedId === orgId);

    // 如果不是学区，查找学校
    if (!org) {
      org = mockData.getSchools().find(s => s.sourcedId === orgId);
    }

    if (!org) {
      return res.status(404).json({
        error: 'not_found',
        message: `Organization with ID ${orgId} not found`
      });
    }

    res.json({ org });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Get Users for Organization
 */
router.get('/orgs/:id/users', (req, res) => {
  try {
    const orgId = req.params.id;

    // 获取该组织的教师
    let users = mockData.getTeachersBySchool(orgId);

    // 如果是学区，获取学区下所有学校的教师
    const district = mockData.getDistricts().find(d => d.sourcedId === orgId);
    if (district) {
      const schools = mockData.getSchoolsByDistrict(orgId);
      users = [];
      schools.forEach(school => {
        users.push(...mockData.getTeachersBySchool(school.sourcedId));
      });
    }

    // 应用过滤
    if (req.pagination.filter) {
      const filterLower = req.pagination.filter.toLowerCase();
      users = users.filter(user =>
        user.givenName.toLowerCase().includes(filterLower) ||
        user.familyName.toLowerCase().includes(filterLower) ||
        user.email.toLowerCase().includes(filterLower) ||
        user.identifier.toLowerCase().includes(filterLower)
      );
    }

    // 分页
    const total = users.length;
    const paginatedUsers = users.slice(
      req.pagination.offset,
      req.pagination.offset + req.pagination.limit
    );

    res.json({
      users: paginatedUsers,
      pagination: {
        total,
        limit: req.pagination.limit,
        offset: req.pagination.offset,
        hasMore: req.pagination.offset + req.pagination.limit < total
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
 * Users (Teachers)
 */
router.get('/users', (req, res) => {
  try {
    let users = mockData.getTeachers();

    // 应用过滤
    if (req.pagination.filter) {
      const filterLower = req.pagination.filter.toLowerCase();
      users = users.filter(user =>
        user.givenName.toLowerCase().includes(filterLower) ||
        user.familyName.toLowerCase().includes(filterLower) ||
        user.email.toLowerCase().includes(filterLower) ||
        user.subjects.some(subject => subject.toLowerCase().includes(filterLower))
      );
    }

    // 排序
    users.sort((a, b) => {
      const field = req.pagination.sort;
      let aVal = a[field];
      let bVal = b[field];

      // 特殊处理组合字段
      if (field === 'name') {
        aVal = `${a.givenName} ${a.familyName}`;
        bVal = `${b.givenName} ${b.familyName}`;
      }

      const order = req.pagination.orderBy === 'desc' ? -1 : 1;

      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });

    // 分页
    const total = users.length;
    const paginatedUsers = users.slice(
      req.pagination.offset,
      req.pagination.offset + req.pagination.limit
    );

    res.json({
      users: paginatedUsers,
      pagination: {
        total,
        limit: req.pagination.limit,
        offset: req.pagination.offset,
        hasMore: req.pagination.offset + req.pagination.limit < total
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
 * Get User by ID
 */
router.get('/users/:id', (req, res) => {
  try {
    const userId = req.params.id;
    const user = mockData.getTeacherById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'not_found',
        message: `User with ID ${userId} not found`
      });
    }

    res.json({ user });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Get Courses for User
 */
router.get('/users/:id/courses', (req, res) => {
  try {
    const userId = req.params.id;
    let courses = mockData.getCoursesByTeacher(userId);

    // 应用过滤
    if (req.pagination.filter) {
      const filterLower = req.pagination.filter.toLowerCase();
      courses = courses.filter(course =>
        course.title.toLowerCase().includes(filterLower) ||
        course.courseCode.toLowerCase().includes(filterLower) ||
        course.subjects.some(subject => subject.toLowerCase().includes(filterLower))
      );
    }

    // 分页
    const total = courses.length;
    const paginatedCourses = courses.slice(
      req.pagination.offset,
      req.pagination.offset + req.pagination.limit
    );

    res.json({
      courses: paginatedCourses,
      pagination: {
        total,
        limit: req.pagination.limit,
        offset: req.pagination.offset,
        hasMore: req.pagination.offset + req.pagination.limit < total
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
 * Courses
 */
router.get('/courses', (req, res) => {
  try {
    let courses = mockData.getCourses();

    // 应用过滤
    if (req.pagination.filter) {
      const filterLower = req.pagination.filter.toLowerCase();
      courses = courses.filter(course =>
        course.title.toLowerCase().includes(filterLower) ||
        course.courseCode.toLowerCase().includes(filterLower) ||
        course.subjects.some(subject => subject.toLowerCase().includes(filterLower))
      );
    }

    // 排序
    courses.sort((a, b) => {
      const field = req.pagination.sort;
      const order = req.pagination.orderBy === 'desc' ? -1 : 1;

      if (a[field] < b[field]) return -1 * order;
      if (a[field] > b[field]) return 1 * order;
      return 0;
    });

    // 分页
    const total = courses.length;
    const paginatedCourses = courses.slice(
      req.pagination.offset,
      req.pagination.offset + req.pagination.limit
    );

    res.json({
      courses: paginatedCourses,
      pagination: {
        total,
        limit: req.pagination.limit,
        offset: req.pagination.offset,
        hasMore: req.pagination.offset + req.pagination.limit < total
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
 * Get Course by ID
 */
router.get('/courses/:id', (req, res) => {
  try {
    const courseId = req.params.id;
    const course = mockData.getCourseById(courseId);

    if (!course) {
      return res.status(404).json({
        error: 'not_found',
        message: `Course with ID ${courseId} not found`
      });
    }

    res.json({ course });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Academic Sessions
 */
router.get('/academicSessions', (req, res) => {
  const academicSessions = [
    {
      sourcedId: '2023-2024',
      status: 'active',
      dateLastModified: new Date().toISOString(),
      metadata: {},
      title: '2023-2024 Academic Year',
      type: 'schoolYear',
      startDate: '2023-08-15',
      endDate: '2024-06-15',
      parent: null,
      children: [
        {
          href: '/academicSessions/2023-fall',
          sourcedId: '2023-fall',
          type: 'semester'
        },
        {
          href: '/academicSessions/2024-spring',
          sourcedId: '2024-spring',
          type: 'semester'
        }
      ]
    },
    {
      sourcedId: '2024-2025',
      status: 'active',
      dateLastModified: new Date().toISOString(),
      metadata: {},
      title: '2024-2025 Academic Year',
      type: 'schoolYear',
      startDate: '2024-08-15',
      endDate: '2025-06-15',
      parent: null,
      children: [
        {
          href: '/academicSessions/2024-fall',
          sourcedId: '2024-fall',
          type: 'semester'
        },
        {
          href: '/academicSessions/2025-spring',
          sourcedId: '2025-spring',
          type: 'semester'
        }
      ]
    }
  ];

  res.json({ academicSessions });
});

/**
 * Get Academic Session by ID
 */
router.get('/academicSessions/:id', (req, res) => {
  const sessionId = req.params.id;

  // 模拟学期数据
  const sessions = {
    '2024-2025': {
      sourcedId: '2024-2025',
      status: 'active',
      dateLastModified: new Date().toISOString(),
      metadata: {},
      title: '2024-2025 Academic Year',
      type: 'schoolYear',
      startDate: '2024-08-15',
      endDate: '2025-06-15'
    },
    '2024-fall': {
      sourcedId: '2024-fall',
      status: 'active',
      dateLastModified: new Date().toISOString(),
      metadata: {},
      title: 'Fall 2024 Semester',
      type: 'semester',
      startDate: '2024-08-15',
      endDate: '2024-12-20',
      parent: {
        href: '/academicSessions/2024-2025',
        sourcedId: '2024-2025',
        type: 'schoolYear'
      }
    },
    '2025-spring': {
      sourcedId: '2025-spring',
      status: 'active',
      dateLastModified: new Date().toISOString(),
      metadata: {},
      title: 'Spring 2025 Semester',
      type: 'semester',
      startDate: '2025-01-15',
      endDate: '2025-06-15',
      parent: {
        href: '/academicSessions/2024-2025',
        sourcedId: '2024-2025',
        type: 'schoolYear'
      }
    }
  };

  const session = sessions[sessionId];

  if (!session) {
    return res.status(404).json({
      error: 'not_found',
      message: `Academic session with ID ${sessionId} not found`
    });
  }

  res.json({ academicSession: session });
});

/**
 * Error handling for unsupported endpoints
 */
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'endpoint_not_found',
    message: `OneRoster endpoint ${req.originalUrl} is not implemented`,
    available_endpoints: [
      '/orgs',
      '/users',
      '/courses',
      '/academicSessions'
    ]
  });
});

module.exports = router;