const express = require('express');
const router = express.Router();
const schooldayMockData = require('../config/schooldayMockData');

// 模拟请求延迟，更真实地模拟API调用
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// OAuth 2.0 Token Endpoint
router.post('/oauth/token', async (req, res) => {
  await simulateDelay(800);

  const { grant_type, client_id, client_secret, code } = req.body;

  // 验证基本参数
  if (!grant_type || !client_id) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Missing required parameters'
    });
  }

  // 模拟成功的token响应
  res.json(schooldayMockData.oauthToken);
});

// Token刷新端点
router.post('/oauth/refresh', async (req, res) => {
  await simulateDelay(600);

  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Missing refresh token'
    });
  }

  // 返回新的access token
  res.json({
    ...schooldayMockData.oauthToken,
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_refreshed...",
    expires_in: 3600
  });
});

// Discovery API - 获取连接的学区
router.get('/api/v1/districts', async (req, res) => {
  await simulateDelay(1000);

  const { page = 1, per_page = 50, status = 'active' } = req.query;

  // 模拟分页和过滤
  let filteredDistricts = schooldayMockData.districts.data;
  if (status !== 'all') {
    filteredDistricts = filteredDistricts.filter(d => d.status === status);
  }

  res.json({
    data: filteredDistricts,
    pagination: {
      ...schooldayMockData.districts.pagination,
      page: parseInt(page),
      per_page: parseInt(per_page)
    }
  });
});

// 获取特定学区信息
router.get('/api/v1/districts/:district_id', async (req, res) => {
  await simulateDelay(400);

  const { district_id } = req.params;
  const district = schooldayMockData.districts.data.find(d => d.id === district_id);

  if (!district) {
    return res.status(404).json({
      error: 'district_not_found',
      message: 'The specified district was not found'
    });
  }

  res.json({ data: district });
});

// OneRoster API - 获取教师数据
router.get('/ims/oneroster/v1p1/users', async (req, res) => {
  await simulateDelay(1200);

  const { filter, limit = 100, offset = 0 } = req.query;

  let teachers = schooldayMockData.oneRosterTeachers.users;

  // 支持OneRoster标准的过滤
  if (filter) {
    // 例如: filter=role='teacher' AND status='active'
    if (filter.includes("role='teacher'")) {
      teachers = teachers.filter(user => user.role === 'teacher');
    }
    if (filter.includes("status='active'")) {
      teachers = teachers.filter(user => user.status === 'active');
    }
  }

  // 分页
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedTeachers = teachers.slice(startIndex, endIndex);

  res.json({
    users: paginatedTeachers,
    meta: {
      total: teachers.length,
      offset: startIndex,
      limit: parseInt(limit)
    }
  });
});

// OneRoster API - 获取特定教师
router.get('/ims/oneroster/v1p1/users/:sourcedId', async (req, res) => {
  await simulateDelay(300);

  const { sourcedId } = req.params;
  const teacher = schooldayMockData.oneRosterTeachers.users.find(u => u.sourcedId === sourcedId);

  if (!teacher) {
    return res.status(404).json({
      error: 'user_not_found',
      message: 'The specified user was not found'
    });
  }

  res.json({ user: teacher });
});

// OneRoster API - 获取课程数据
router.get('/ims/oneroster/v1p1/classes', async (req, res) => {
  await simulateDelay(900);

  const { filter, limit = 100, offset = 0 } = req.query;

  let classes = schooldayMockData.oneRosterCourses.classes;

  // 过滤逻辑
  if (filter) {
    if (filter.includes("status='active'")) {
      classes = classes.filter(cls => cls.status === 'active');
    }
  }

  // 分页
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedClasses = classes.slice(startIndex, endIndex);

  res.json({
    classes: paginatedClasses,
    meta: {
      total: classes.length,
      offset: startIndex,
      limit: parseInt(limit)
    }
  });
});

// OneRoster API - 获取教师的课程
router.get('/ims/oneroster/v1p1/users/:sourcedId/classes', async (req, res) => {
  await simulateDelay(700);

  const { sourcedId } = req.params;

  // 模拟教师课程关联（在真实API中会有enrollment数据）
  let teacherClasses = [];
  if (sourcedId === 'teacher_001') {
    teacherClasses = schooldayMockData.oneRosterCourses.classes.filter(cls =>
      ['class_001', 'class_002'].includes(cls.sourcedId)
    );
  } else if (sourcedId === 'teacher_002') {
    teacherClasses = schooldayMockData.oneRosterCourses.classes.filter(cls =>
      cls.sourcedId === 'class_003'
    );
  }

  res.json({
    classes: teacherClasses,
    meta: {
      total: teacherClasses.length
    }
  });
});

// Schoolday Academy API - 获取专业发展课程
router.get('/academy/api/v1/courses', async (req, res) => {
  await simulateDelay(800);

  const { category, level, format, search } = req.query;

  let courses = schooldayMockData.academyCourses.courses;

  // 过滤逻辑
  if (category) {
    courses = courses.filter(course => course.category === category);
  }
  if (level) {
    courses = courses.filter(course => course.level === level);
  }
  if (format) {
    courses = courses.filter(course => course.format === format);
  }
  if (search) {
    courses = courses.filter(course =>
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({
    courses: courses,
    total: courses.length
  });
});

// Schoolday Academy API - 获取课程推荐
router.get('/academy/api/v1/recommendations/:teacher_id', async (req, res) => {
  await simulateDelay(600);

  const { teacher_id } = req.params;
  const recommendation = schooldayMockData.academyCourses.recommendations.find(
    rec => rec.teacher_id === teacher_id
  );

  if (!recommendation) {
    return res.json({
      teacher_id,
      recommended_courses: [],
      reason: "No recommendations available at this time",
      confidence_score: 0
    });
  }

  // 获取推荐课程的详细信息
  const recommendedCourseDetails = recommendation.recommended_courses.map(courseId =>
    schooldayMockData.academyCourses.courses.find(course => course.id === courseId)
  ).filter(Boolean);

  res.json({
    ...recommendation,
    course_details: recommendedCourseDetails
  });
});

// Schoolday Partner API - 同步状态
router.get('/partner/api/v1/sync/status', async (req, res) => {
  await simulateDelay(200);

  res.json(schooldayMockData.evaluationIntegration.sync_status);
});

// Schoolday Partner API - Webhook事件
router.get('/partner/api/v1/webhooks/events', async (req, res) => {
  await simulateDelay(400);

  const { since, limit = 50 } = req.query;

  let events = schooldayMockData.evaluationIntegration.webhook_events;

  // 如果提供了since参数，过滤事件
  if (since) {
    const sinceDate = new Date(since);
    events = events.filter(event => new Date(event.timestamp) > sinceDate);
  }

  // 限制返回数量
  events = events.slice(0, parseInt(limit));

  res.json({
    events: events,
    rate_limiting: schooldayMockData.evaluationIntegration.rate_limiting
  });
});

// 手动触发数据同步
router.post('/partner/api/v1/sync/trigger', async (req, res) => {
  await simulateDelay(2000); // 模拟长时间操作

  const { data_types = ['teachers', 'courses', 'evaluations'] } = req.body;

  res.json({
    sync_id: `sync_${Date.now()}`,
    status: 'initiated',
    data_types: data_types,
    estimated_completion: new Date(Date.now() + 300000).toISOString(), // 5分钟后
    message: 'Data synchronization has been initiated'
  });
});

// 错误处理中间件
router.use((err, req, res, next) => {
  console.error('Schoolday API Error:', err);

  res.status(err.status || 500).json({
    error: 'api_error',
    message: err.message || 'An error occurred while processing your request',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;